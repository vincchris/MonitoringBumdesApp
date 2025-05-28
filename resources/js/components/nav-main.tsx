// nav-main.tsx
import { SidebarGroup, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';

export function NavMain({ items = [], groupLabel }: { items: NavItem[]; groupLabel: string }) {
  const page = usePage();

  return (
    <SidebarGroup className="px-2 py-0">
      <SidebarGroupLabel className="text-xs font-medium text-muted-foreground px-3 pt-4 pb-2 uppercase tracking-wide">
        {groupLabel}
      </SidebarGroupLabel>
      <SidebarMenu>
        {items.map((item) => (
          <SidebarMenuItem key={item.title}>
            <SidebarMenuButton
              asChild
              isActive={item.href === page.url}
              tooltip={{ children: item.title }}
            >
              <Link href={item.href} prefetch>
                {item.icon && <item.icon />}
                <span>{item.title}</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  );
}
