"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";

const CommandSearch: React.FC = () => {
	const [value, setValue] = useState("");
	const router = useRouter();

	const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setValue(event.target.value);
	};

	const handleSubmit = (e: React.FormEvent) => {
		e.preventDefault();
		if (value.trim()) {
			router.push(`/search?q=${encodeURIComponent(value.trim())}`);
		}
	};

	return (
		<div className="absolute right-0 left-0 flex flex-1 justify-center items-center gap-0 w-full">
			<div className="flex w-1/2 max-w-lg min-w-[300px]">
				<button className="text-[#b3b3b3] cursor-pointer text-center normal-case touch-manipulation duration-300 select-none align-middle p-3 rounded-full bg-[#1f1f1f] ml-0 flex-shrink-0">
					<span aria-hidden="true" className="flex text-[#b3b3b3]">
						<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" className="w-[24px] h-[24px] fill-current">
							<path d="M12.5 3.247a1 1 0 0 0-1 0L4 7.577V20h4.5v-6a1 1 0 0 1 1-1h5a1 1 0 0 1 1 1v6H20V7.577l-7.5-4.33zm-2-1.732a3 3 0 0 1 3 0l7.5 4.33a2 2 0 0 1 1 1.732V21a1 1 0 0 1-1 1h-6.5a1 1 0 0 1-1-1v-6h-3v6a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.577a2 2 0 0 1 1-1.732l7.5-4.33z"></path>
						</svg>
					</span>
				</button>
				<span role="presentation" className="w-full h-full box-border">
					<div className="w-full relative px-2">
						<form onSubmit={handleSubmit} role="search" className="relative w-full transition-all duration-200 ease-in-out" data-encore-id="formInputIcon">
							<div className="absolute right-auto left-0 z-[1] top-1/2 -translate-y-1/2 flex text[#656565]">
								<div>
									<button
										type="submit"
										className="hidden px-3 text-[#656565] relative bg-transparent border-0 rounded-[9999px] cursor-pointer text-center select-none align-middle p-0"
										aria-label="Search"
										data-encore-id="buttonTertiary"
									>
										<span aria-hidden="true" className="flex align-baseline ">
											<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" className="block fill-current w-[24px] h-[24px] px-3 text-[#656565]">
												<path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z"></path>
											</svg>
										</span>
									</button>
									<svg
										data-encore-id="icon"
										role="img"
										aria-hidden="true"
										data-testid="search-icon"
										className="block fill-current w-[48px] h-[48px] px-3 text-[#656565]"
										viewBox="0 0 24 24"
									>
										<path d="M10.533 1.27893C5.35215 1.27893 1.12598 5.41887 1.12598 10.5579C1.12598 15.697 5.35215 19.8369 10.533 19.8369C12.767 19.8369 14.8235 19.0671 16.4402 17.7794L20.7929 22.132C21.1834 22.5226 21.8166 22.5226 22.2071 22.132C22.5976 21.7415 22.5976 21.1083 22.2071 20.7178L17.8634 16.3741C19.1616 14.7849 19.94 12.7634 19.94 10.5579C19.94 5.41887 15.7138 1.27893 10.533 1.27893ZM3.12598 10.5579C3.12598 6.55226 6.42768 3.27893 10.533 3.27893C14.6383 3.27893 17.94 6.55226 17.94 10.5579C17.94 14.5636 14.6383 17.8369 10.533 17.8369C6.42768 17.8369 3.12598 14.5636 3.12598 10.5579Z"></path>
									</svg>
								</div>
							</div>
							<div className="">
								<input
									onChange={handleChange}
									style={{ inlineSize: "100%" }}
									className="pr-[64px] pl-[48px] text-[#fff] py-3 border-0 appearance-none font-normal text-base cursor-pointer shadow-none rounded-[500px] bg-[#1f1f1f] delay-[0.1s] transition-all duration-[0.1s] ease-in text-ellipsis "
									data-encore-id="formInput"
									data-testid="search-input"
									type="search"
									spellCheck="false"
									placeholder="What do you want to play?"
									value={value}
									tabIndex={0}
								/>
							</div>
							<div className="absolute top-1/2 -translate-y-1/2 right-3 text-[#656565] opacity-1 transition-all duration-100 ease-in-out align-baseline">
								<div className="pl-3 pr-1 border-s border-solid border-[#656565]">
									<button
										data-testid="browse-button"
										className="flex justify-center items-center p-0 text-[#656565] select-none cursor-pointer relative text-center"
										aria-label="Browse"
										data-encore-id="buttonTertiary"
										type="submit"
									>
										<span aria-hidden="true" className="flex align-baseline border-0 m-0 p-0">
											<svg data-encore-id="icon" role="img" aria-hidden="true" viewBox="0 0 24 24" className="block fill-current w-[24px] h-[24px]">
												<path d="M4 2a1 1 0 0 1 1-1h14a1 1 0 0 1 1 1v4H4V2zM1.513 9.37A1 1 0 0 1 2.291 9H21.71a1 1 0 0 1 .978 1.208l-2.17 10.208A2 2 0 0 1 18.562 22H5.438a2 2 0 0 1-1.956-1.584l-2.17-10.208a1 1 0 0 1 .201-.837zM12 17.834c1.933 0 3.5-1.044 3.5-2.333 0-1.289-1.567-2.333-3.5-2.333S8.5 14.21 8.5 15.5c0 1.289 1.567 2.333 3.5 2.333z"></path>
											</svg>
										</span>
									</button>
								</div>
							</div>
						</form>
					</div>
				</span>
			</div>
		</div>
	);
};

export default CommandSearch;
