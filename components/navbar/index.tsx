import React from "react";
import Image from "next/image";
import CommandSearch from "@/components/navbar/SearchBar";

const Navbar = () => {
	return (
		<nav className="bg-black w-full text-white flex justify-between items-center h-[64px] p-2 relative ">
			<div className="relative">
				<Image src="/logo.png" alt="Logo" width={50} height={50} priority />
			</div>
			<CommandSearch />
			<div>account options</div>
		</nav>
	);
};

export default Navbar;
