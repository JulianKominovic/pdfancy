import { Button } from "@heroui/button";
import { NavLink as RouterLink } from "react-router-dom";
import { PlusCircle } from "lucide-react";
import clsx from "clsx";
import { useEffect } from "react";

import sqlite from "@/storage/sqlite";
import useCategoriesStore from "@/stores/categories";
import { PAPER_COLORS } from "@/constants";
import sqliteCategory from "@/storage/sqlite/category";

export const Navbar = () => {
  const classNameFn = ({ isActive }: any) =>
    clsx(isActive ? "opacity-100" : "opacity-50", "flex items-center ");
  const categories = useCategoriesStore((s) => s.categories);
  const updateOrAddCategory = useCategoriesStore((s) => s.updateOrAddCategory);
  const setCategories = useCategoriesStore((s) => s.setCategories);

  useEffect(() => {
    sqliteCategory
      .getAll()
      .then(({ results }) => setCategories(results as any));
  }, []);

  return (
    <nav className="h-full px-4 py-8">
      <ul className="flex flex-col">
        <li>
          <RouterLink className={classNameFn} to="/">
            Recent
          </RouterLink>
        </li>
        {categories.map((category, i) => (
          <li key={category.id + category.name + "nav" + i}>
            <RouterLink className={classNameFn} to={`/category/${category.id}`}>
              {category.name || "No name"}
            </RouterLink>
          </li>
        ))}
        <li>
          <Button
            onPress={() => {
              updateOrAddCategory({
                name: "New category",
                color:
                  PAPER_COLORS[Math.floor(Math.random() * PAPER_COLORS.length)]
                    .color,
                description: "Add a description here",
              });
            }}
          >
            <PlusCircle size={16} /> category
          </Button>
        </li>
      </ul>
      <Button
        color="danger"
        variant="shadow"
        onPress={() => {
          //  Get all tables
          sqlite
            .run("SELECT name FROM sqlite_master WHERE type='table';")
            .then(({ results }) => {
              results.forEach(({ name }) => {
                sqlite.run(`DROP TABLE ${name};`);
              });
            });
        }}
      >
        Delete database
      </Button>
    </nav>
    // <HeroUINavbar maxWidth="xl" position="sticky">
    //   <NavbarContent className="basis-1/5 sm:basis-full" justify="start">
    //     <NavbarBrand className="gap-3 max-w-fit">
    //       <Link
    //         className="flex justify-start items-center gap-1"
    //         color="foreground"
    //         href="/"
    //       >
    //         <Logo />
    //         <p className="font-bold text-inherit">ACME</p>
    //       </Link>
    //     </NavbarBrand>
    //     <div className="hidden lg:flex gap-4 justify-start ml-2">
    //       {siteConfig.navItems.map((item) => (
    //         <NavbarItem key={item.href}>
    //           <Link
    //             className={clsx(
    //               linkStyles({ color: "foreground" }),
    //               "data-[active=true]:text-primary data-[active=true]:font-medium"
    //             )}
    //             color="foreground"
    //             href={item.href}
    //           >
    //             {item.label}
    //           </Link>
    //         </NavbarItem>
    //       ))}
    //     </div>
    //   </NavbarContent>

    //   <NavbarContent
    //     className="hidden sm:flex basis-1/5 sm:basis-full"
    //     justify="end"
    //   >
    //     <NavbarItem className="hidden sm:flex gap-2">
    //       <Link isExternal href={siteConfig.links.twitter} title="Twitter">
    //         <TwitterIcon className="text-default-500" />
    //       </Link>
    //       <Link isExternal href={siteConfig.links.discord} title="Discord">
    //         <DiscordIcon className="text-default-500" />
    //       </Link>
    //       <Link isExternal href={siteConfig.links.github} title="GitHub">
    //         <GithubIcon className="text-default-500" />
    //       </Link>
    //       {/* <ThemeSwitch /> */}
    //     </NavbarItem>
    //     <NavbarItem className="hidden lg:flex">{searchInput}</NavbarItem>
    //     <NavbarItem className="hidden md:flex">
    //       <Button
    //         isExternal
    //         as={Link}
    //         className="text-sm font-normal text-default-600 bg-default-100"
    //         href={siteConfig.links.sponsor}
    //         startContent={<HeartFilledIcon className="text-danger" />}
    //         variant="flat"
    //       >
    //         Sponsor
    //       </Button>
    //     </NavbarItem>
    //   </NavbarContent>

    //   <NavbarContent className="sm:hidden basis-1 pl-4" justify="end">
    //     <Link isExternal href={siteConfig.links.github}>
    //       <GithubIcon className="text-default-500" />
    //     </Link>
    //     {/* <ThemeSwitch /> */}
    //     <NavbarMenuToggle />
    //   </NavbarContent>

    //   <NavbarMenu>
    //     {searchInput}
    //     <div className="mx-4 mt-2 flex flex-col gap-2">
    //       {siteConfig.navMenuItems.map((item, index) => (
    //         <NavbarMenuItem key={`${item}-${index}`}>
    //           <Link
    //             color={
    //               index === 2
    //                 ? "primary"
    //                 : index === siteConfig.navMenuItems.length - 1
    //                   ? "danger"
    //                   : "foreground"
    //             }
    //             href="#"
    //             size="lg"
    //           >
    //             {item.label}
    //           </Link>
    //         </NavbarMenuItem>
    //       ))}
    //     </div>
    //   </NavbarMenu>
    // </HeroUINavbar>
  );
};
