import type { ReactNode } from 'react';

export const metadata = {
	title: 'EarthDesign Admin CMS',
};

export default function AdminLayout({ children }: { children: ReactNode }) {
	return (
		<div className="min-h-screen bg-gray-50">
			<main>{children}</main>
		</div>
	);
}
