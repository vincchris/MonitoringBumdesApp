import UnitusahaPage from '@/components/unitUsahaPage-design';
import { usePage } from '@inertiajs/react';

interface TarifItem {
    label: string;
    detail: string;
    basePrice: number;
}

type Tarifs = {
    [unitId: string]: TarifItem[];
};

const UnitUsaha = () => {
    const { tarifs } = usePage().props as unknown as { tarifs: Tarifs };

    return <UnitusahaPage tarifs={tarifs} />;
};

export default UnitUsaha;
