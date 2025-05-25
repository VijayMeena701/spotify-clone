"use client";

import React from "react";
import Image from "next/image";
import CommandSearch from "@/src/components/navbar/SearchBar";
import AccountMenu from "@/src/components/navbar/AccountMenu";
import Link from "next/link";

const Navbar = () => {
	return (
		<nav className="bg-black w-full text-white flex justify-between items-center h-[64px] px-4 sticky top-0 z-[999]">
			<div className="relative z-10">
				<Link href="/">
					<Image src="/logo.png" alt="Logo" width={50} height={50} priority />
				</Link>
			</div>
			<CommandSearch />
			<AccountMenu />
		</nav>
	);
};

export default Navbar;
