import React from 'react';

interface FooterConfig {
    owner: string;
    copyright: string;
}

interface SupportImg {
    src: string;
    alt: string;
}

const footerConfig: FooterConfig = {
    owner: 'Desa Sumber Jaya, BUMDes Bagja Waluya',
    copyright: 'Hak Cipta Dilindungi.',
};

const supportImgs: SupportImg[] = [
    { src: '/assets/images/logobima.png', alt: 'Logo Bima' },
    { src: '/assets/images/logo-kemendiktisaintek.png', alt: 'Logo Kemendiktisaintek' },
    { src: '/assets/images/Logo UBSI.png', alt: 'Logo Ubsi' },
];

export const FooterInfo: React.FC = () => {
    return (
        <div className="mt-10 border-t border-gray-200 pt-4">
            <div className="flex justify-center gap-3">
                {supportImgs.map((img) => (
                    <img key={img.src} src={img.src} alt={img.alt} className="h-12 w-auto object-contain" />
                ))}
            </div>
            <div className="mt-2 text-center text-xs text-gray-500">
                <p>{footerConfig.owner}</p>
                <p>{footerConfig.copyright}</p>
            </div>
        </div>
    );
};
