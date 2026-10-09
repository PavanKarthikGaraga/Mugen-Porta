import SDGsMapper from "@/app/components/dashboard/SDGsMapper";

export default function AdminSDGsMapperPage() {
    return (
        <div className="p-6 h-full overflow-y-auto">
            <SDGsMapper role="admin" />
        </div>
    );
}
