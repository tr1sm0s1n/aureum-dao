import React, { useState } from 'react';
import BgImg from '../../assets/website/white-bg.jpg';

// Background image style
const bgImage: React.CSSProperties = {
    backgroundImage: `url(${BgImg})`,
    backgroundColor: "#6366FF",
    backgroundPosition: "center",
    backgroundRepeat: "no-repeat",
    backgroundSize: "cover",
    height: "100%",
    width: "100%",
};

interface Testimonial {
    id: number;
    name: string;
    text: string;
    status: 'Active' | 'Approved' | 'Collected';
    amount: number;
}

const TestimonialData: Testimonial[] = [
    {
        id: 1,
        name: "Dilshad",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Approved",
        amount: 2345,
    },
    {
        id: 2,
        name: "Sabir ali",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Active",
        amount: 34567,
    },
    {
        id: 3,
        name: "Dipankar kumar",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Approved",
        amount: 8765,
    },
    {
        id: 5,
        name: "Satya Narayan",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Active",
        amount: 0,
    },
    {
        id: 6,
        name: "John Doe",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Collected",
        amount: 38954,
    },
    {
        id: 7,
        name: "Samual",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Collected",
        amount: 54,
    },
    {
        id: 8,
        name: "Joseph",
        text: "Lorem ipsum dolor sit amet consectetur adipisicing elit. Eaque reiciendis inventore iste ratione ex alias quis magni at optio",
        status: "Approved",
        amount: 0,
    },
];

const AllProposals = () => {
    const [selectedStatus, setSelectedStatus] = useState<'Active' | 'Approved' | 'Collected' | 'All'>('All');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [currentPage, setCurrentPage] = useState<number>(1);

    const testimonialsPerPage = 5;
    const indexOfLastTestimonial = currentPage * testimonialsPerPage;
    const indexOfFirstTestimonial = indexOfLastTestimonial - testimonialsPerPage;

    // Filter testimonials based on selected status and search query
    const filteredTestimonials = TestimonialData.filter(item => {
        const matchesStatus = selectedStatus === 'All' || item.status === selectedStatus;
        const matchesSearch = item.name.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
    });

    const currentTestimonials = filteredTestimonials.slice(indexOfFirstTestimonial, indexOfLastTestimonial);
    const totalPages = Math.ceil(filteredTestimonials.length / testimonialsPerPage);

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(prevPage => prevPage + 1);
        }
    };

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            setCurrentPage(prevPage => prevPage - 1);
        }
    };

    return (
        <>
            <span id="allproposals"></span>
            <div style={bgImage}>
                <div className="py-10">
                    <div className="container">
                        {/* Heading section */}
                        <div className="text-center mb-20">
                            <h1 className="text-4xl font-bold font-cursive text-gray-800">
                                All Proposals
                            </h1>
                        </div>
                        <div className="relative overflow-x-auto shadow-md sm:rounded-lg">
                            <div className="flex items-center justify-between flex-column flex-wrap md:flex-row space-y-4 md:space-y-0 pb-4 bg-white dark:bg-gray-900 p-4">
                                <div>
                                    {/* Dropdown for selecting status */}
                                    <select
                                        id="dropdownActionButton"
                                        className="inline-flex items-center text-gray-500 bg-white border border-gray-300 focus:outline-none hover:bg-gray-100 focus:ring-4 focus:ring-gray-100 font-medium rounded-lg text-sm px-3 py-1.5 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:bg-gray-700 dark:hover:border-gray-600 dark:focus:ring-gray-700"
                                        value={selectedStatus}
                                        onChange={(e) => setSelectedStatus(e.target.value as 'Active' | 'Approved' | 'Collected' | 'All')}
                                    >
                                        <option value="All">All</option>
                                        <option value="Active">Active</option>
                                        <option value="Approved">Approved</option>
                                        <option value="Collected">Collected</option>
                                    </select>
                                </div>
                                <label className="sr-only">Search</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 rtl:inset-r-0 start-0 flex items-center ps-3 pointer-events-none">
                                        <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                            <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z" />
                                        </svg>
                                    </div>
                                    <input
                                        type="text"
                                        id="table-search-users"
                                        className="block p-2 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg w-80 bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                                        placeholder="Search by name"
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                    />
                                </div>
                            </div>
                            <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                                <thead className="text-xs text-gray-700 uppercase bg-gray-50 dark:bg-gray-700 dark:text-gray-400">
                                    <tr>
                                        <th scope="col" className="px-6 py-3">Id</th>
                                        <th scope="col" className="px-6 py-3">Name</th>
                                        <th scope="col" className="px-6 py-3">Description</th>
                                        <th scope="col" className="px-6 py-3">Status</th>
                                        <th scope="col" className="px-6 py-3">Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {currentTestimonials.map((item, index) => (
                                        <tr key={index} className="bg-white border-b dark:bg-gray-800 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600">
                                            <th scope="row" className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{item.id}</th>
                                            <td className="px-6 py-4">{item.name}</td>
                                            <td className="px-6 py-4">{item.text}</td>
                                            <td className={`${item.status === "Active" ? "text-green-500" : item.status === "Approved" ? "text-blue-500" : "text-orange-500"} px-6 py-4`}>{item.status}</td>
                                            <td className="px-6 py-4">{item.amount}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {/* Pagination controls */}
                            <div className="flex justify-between p-4">
                                <button
                                    onClick={handlePreviousPage}
                                    disabled={currentPage === 1}
                                    className="px-4 py-2 bg-primary hover:bg-brandDark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Previous
                                </button>
                                <span>{`Page ${currentPage} of ${totalPages}`}</span>
                                <button
                                    onClick={handleNextPage}
                                    disabled={currentPage === totalPages}
                                    className="px-4 py-2 bg-primary hover:bg-brandDark text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default AllProposals;
