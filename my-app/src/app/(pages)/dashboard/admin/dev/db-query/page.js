"use client";
import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { FiDatabase, FiPlay, FiDownload, FiAlertTriangle, FiInfo } from "react-icons/fi";

export default function DatabaseQueryPage() {
    const [query, setQuery] = useState('');
    const [results, setResults] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [sampleQueries, setSampleQueries] = useState([]);
    const [tables, setTables] = useState([]);
    const [hasAccess, setHasAccess] = useState(null); // null = checking, true = has access, false = no access
    const router = useRouter();

    const checkAccess = useCallback(async () => {
        try {
            const response = await fetch('/api/auth/me');
            if (response.ok) {
                const data = await response.json();
                const hasDevAccess = data.username === '2300032048';
                setHasAccess(hasDevAccess);
                
                if (!hasDevAccess) {
                    router.push('/dashboard/admin');
                }
            } else {
                setHasAccess(false);
                router.push('/dashboard/admin');
            }
        } catch (error) {
            console.error('Error checking access:', error);
            setHasAccess(false);
            router.push('/dashboard/admin');
        }
    }, [router]);

    const loadDatabaseInfo = useCallback(async () => {
        try {
            const response = await fetch('/api/dashboard/admin/db-query');
            const data = await response.json();
            
            if (data.success) {
                setSampleQueries(data.data.sampleQueries);
                setTables(data.data.tables);
            } else if (response.status === 403) {
                // Access denied, redirect
                router.push('/dashboard/admin');
            }
        } catch (error) {
            console.error('Error loading database info:', error);
        }
    }, [router]);

    useEffect(() => {
        checkAccess();
    }, [checkAccess]);

    useEffect(() => {
        if (hasAccess === true) {
            loadDatabaseInfo();
        }
    }, [hasAccess, loadDatabaseInfo]);

    const executeQuery = async () => {
        if (!query.trim()) {
            setError('Please enter a query');
            return;
        }

        setLoading(true);
        setError('');
        setResults(null);

        try {
            const response = await fetch('/api/dashboard/admin/db-query', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ query: query.trim() }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Query execution failed');
            }

            setResults(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const downloadResults = () => {
        if (!results || !results.data || results.data.length === 0) return;

        const headers = Object.keys(results.data[0]);
        const csvContent = [
            headers.join(','),
            ...results.data.map(row => 
                headers.map(header => {
                    const value = row[header];
                    if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
                        return `"${value.replace(/"/g, '""')}"`;
                    }
                    return value;
                }).join(',')
            )
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `query_results_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);
    };

    const loadSampleQuery = (sampleQuery) => {
        setQuery(sampleQuery);
    };

    // Show loading while checking access
    if (hasAccess === null) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
                        <p className="text-gray-600">Checking access permissions...</p>
                    </div>
                </div>
            </div>
        );
    }

    // Show access denied if user doesn't have dev access
    if (hasAccess === false) {
        return (
            <div className="p-6">
                <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                        <FiAlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h2>
                        <p className="text-gray-600">You don&apos;t have permission to access this page.</p>
                        <p className="text-sm text-gray-500 mt-2">Developer privileges required.</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-2xl font-bold text-gray-900">Database Query Tool</h1>
                <div className="flex items-center space-x-2 text-yellow-600 bg-yellow-50 px-3 py-2 rounded-lg">
                    <FiAlertTriangle className="h-4 w-4" />
                    <span className="text-sm font-medium">Use with caution</span>
                </div>
            </div>

            {/* Warning Notice */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                <div className="flex">
                    <FiAlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
                    <div className="ml-3">
                        <h3 className="text-sm font-medium text-red-800">Important Warning</h3>
                        <div className="mt-2 text-sm text-red-700">
                            <ul className="list-disc list-inside space-y-1">
                                <li>This tool allows direct database access. Use only SELECT queries for safety.</li>
                                <li>Avoid using UPDATE, DELETE, INSERT, or DROP statements.</li>
                                <li>Large result sets may take time to load and could impact performance.</li>
                                <li>Query timeout is set to 10 seconds maximum.</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Query Input Section */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <div className="flex justify-between items-center mb-4">
                            <h2 className="text-lg font-semibold text-gray-900">SQL Query</h2>
                            <button
                                onClick={executeQuery}
                                disabled={loading || !query.trim()}
                                className="flex items-center space-x-2 px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <FiPlay className="h-4 w-4" />
                                <span>{loading ? 'Executing...' : 'Execute Query'}</span>
                            </button>
                        </div>

                        <textarea
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter your SQL query here..."
                            className="w-full h-32 p-3 border border-gray-300 rounded-lg font-mono text-sm focus:ring-2 focus:ring-gray-500 focus:border-gray-500"
                            disabled={loading}
                        />

                        {error && (
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-red-700 text-sm">{error}</p>
                            </div>
                        )}
                    </div>

                    {/* Results Section */}
                    {results && (
                        <div className="mt-6 bg-white rounded-lg shadow-md border border-gray-200">
                            <div className="p-6 border-b border-gray-200">
                                <div className="flex justify-between items-center">
                                    <h2 className="text-lg font-semibold text-gray-900">Query Results</h2>
                                    <div className="flex items-center space-x-4">
                                        <div className="text-sm text-gray-600">
                                            <span className="font-medium">{results.metadata?.returnedRows || 0}</span> rows
                                            {results.metadata?.isLimited && <span className="text-red-600"> (limited)</span>}
                                            <span className="ml-2">• {results.metadata?.executionTime}</span>
                                        </div>
                                        {results.data && results.data.length > 0 && (
                                            <button
                                                onClick={downloadResults}
                                                className="flex items-center space-x-2 px-3 py-1 bg-black text-white rounded text-sm hover:bg-gray-800 transition-colors"
                                            >
                                                <FiDownload className="h-3 w-3" />
                                                <span>Download CSV</span>
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="p-6">
                                {results.data && results.data.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-gray-200">
                                            <thead className="bg-gray-50">
                                                <tr>
                                                    {Object.keys(results.data[0]).map((column) => (
                                                        <th
                                                            key={column}
                                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                                        >
                                                            {column}
                                                        </th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-gray-200">
                                                {results.data.map((row, rowIndex) => (
                                                    <tr key={`row-${JSON.stringify(row).slice(0, 50)}-${rowIndex}`} className="hover:bg-gray-50">
                                                        {Object.keys(row).map((column) => {
                                                            const value = row[column];
                                                            let displayValue;
                                                            
                                                            if (value === null) {
                                                                displayValue = <span className="text-gray-400 italic">NULL</span>;
                                                            } else if (typeof value === 'object') {
                                                                displayValue = JSON.stringify(value);
                                                            } else {
                                                                displayValue = String(value);
                                                            }

                                                            return (
                                                                <td
                                                                    key={`cell-${rowIndex}-${column}`}
                                                                    className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                                                >
                                                                    {displayValue}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <div className="text-center py-8">
                                        <FiDatabase className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <p className="text-gray-600">Query executed successfully but returned no results</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>

                {/* Sidebar with Sample Queries and Tables */}
                <div className="space-y-6">
                    {/* Available Tables */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiDatabase className="h-5 w-5 mr-2" />
                            Available Tables
                        </h3>
                        <div className="space-y-2">
                            {tables.map((table) => (
                                <button
                                    key={table}
                                    className="p-2 bg-gray-50 rounded text-sm font-mono hover:bg-gray-100 transition-colors w-full text-left"
                                    onClick={() => setQuery(`SELECT * FROM ${table} LIMIT 10;`)}
                                >
                                    {table}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Sample Queries */}
                    <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                            <FiInfo className="h-5 w-5 mr-2" />
                            Sample Queries
                        </h3>
                        <div className="space-y-4">
                            {sampleQueries.map((sample, index) => (
                                <button
                                    key={`sample-${sample.name}-${index}`}
                                    className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors w-full text-left"
                                    onClick={() => loadSampleQuery(sample.query)}
                                >
                                    <h4 className="font-medium text-gray-900 mb-1">{sample.name}</h4>
                                    <p className="text-sm text-gray-600 mb-2">{sample.description}</p>
                                    <code className="text-xs bg-gray-100 px-2 py-1 rounded">{sample.query}</code>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
