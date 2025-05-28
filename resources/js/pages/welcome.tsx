import { useEffect } from 'react';
import { usePage } from '@inertiajs/react';

export default function Welcome() {
    useEffect(() => {
        window.location.href = '/Login'; // Redirect ke /home
    }, []);

    return null; // Tidak menampilkan apapun karena langsung redirect
}
