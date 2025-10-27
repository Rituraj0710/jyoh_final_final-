// "use client";
// import Link from "next/link";
// import { useEffect, useState } from "react";
// import { useRouter } from "next/navigation";
// import Loading from "./Loading";
// import Cookies from "js-cookie";
// import Avatar from "./ui/Avatar";
// import AgentAvatar from "./ui/AgentAvatar";
// const Navbar = () => {
//   const [isDropdownOpen, setIsDropdownOpen] = useState(false);
//   const [isAuth, setIsAuth] = useState(false);
//   const [role, setRole] = useState(null);
//   const router = useRouter();
//   useEffect(() => {
//     const readAuth = () => {
//       const authLS = typeof window !== 'undefined' ? localStorage.getItem("is_auth") : null;
//       setIsAuth(!!authLS);
//       const userRole = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
//       setRole(userRole);
//     };
//     readAuth();
//     const onStorage = (e) => {
//       if (e.key === 'is_auth' || e.key === 'role') readAuth();
//     };
//     window.addEventListener('storage', onStorage);
//     return () => window.removeEventListener('storage', onStorage);
//   },[]);

//   const handleLogout = () => {
//     if (typeof window !== 'undefined'){
//       localStorage.removeItem('access_token');
//       localStorage.removeItem('refresh_token');
//       localStorage.removeItem('role');
//       localStorage.removeItem('user_email');
//       localStorage.removeItem('user_id');
//       localStorage.removeItem('is_auth');
//     }
//     setIsAuth(false);
//     setRole(null);
//     router.push('/');
//   };

//   return (
//     <>
//       {isAuth === null && <Loading />}
//       <div className="drawer z-50 sticky top-0 ">
//         <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />
//         <div className="drawer-content">
//           <nav className="bg-slate-400 shadow-md border-b border-gray-200 s">
//             <div className="container mx-auto flex justify-between items-center py-4 px-6">
//               {/* Logo Section */}
//               <div className="flex items-center space-x-4">
//                 <Link href={"/"}>
//                   <img
//                     width="50"
//                     height="50"
//                     className="w-12 md:w-20 object-contain"
//                     src="/logo_bg.png"
//                     alt="mylogo"
//                   />
//                 </Link>
//               </div>

//               {/* Navbar Links for Desktop */}
//               <div className="hidden md:flex space-x-8">
//                 <Link
//                   href={"/"}
//                   className="text-gray-700 hover:text-gray-900 font-medium"
//                 >
//                   {"Home"}
//                 </Link>
//                 <Link
//                   href={"/about"}
//                   className="text-gray-700 hover:text-gray-900 font-medium"
//                 >
//                   {"About"}
//                 </Link>

//                 {/* Services Dropdown */}
//                 <div className="dropdown relative ">
//                   <label
//                     tabIndex={0}
//                     className="cursor-pointer text-gray-700 hover:text-gray-900 font-medium"
//                   >
//                     {"Services"}
//                   </label>
//                   <ul
//                     tabIndex={0}
//                     className="dropdown-content menu p-2 shadow bg-gray-600 rounded-box w-52 mt-2 absolute z-50 text-white"
//                   >
//                     <li>
//                       <Link href={"/will-deed"}>{"Will Deed Form"}</Link>
//                     </li>
//                     <li>
//                       <Link href={"/sale-deed"}>{"Sale Deed Form"}</Link>
//                     </li>
//                     <li>
//                       <Link href={"/trust-deed"}>{"Trust Deed Form"}</Link>
//                     </li>
//                     <li>
//                       <Link href={"/property-registration"}>{"Property Registration Form"}</Link>
//                     </li>
//                     <li>
//                       <Link href={"/property-sale-certificate"}>{"Property Sale Certificate Generator"}</Link>
//                     </li>
//                     <li>
//                       <Link href={"/power-of-attorney"}>{"Power of Attorney Form"}</Link>
//                     </li>
//                     <li>
//                       <Link href={"/adoption-deed"}>{"Adoption Deed Form"}</Link>
//                     </li>
//                   </ul>
//                 </div>

//                 <Link
//                   href={"/contact"}
//                   className="text-gray-700 hover:text-gray-900 font-medium"
//                 >
//                   {"Contact"}
//                 </Link>
//               </div>
//               <div className="flex items-center space-x-4">
//                 {isAuth ? (
//                   <>
//                     {role === "user" ? (
//                       <Link href="/user/profile" className="text-black mr-4">
//                         <Avatar />
//                       </Link>
//                     ) : (
//                       <Link href="/agent/agent-profile" className="text-black mr-4">
//                         <AgentAvatar />
//                       </Link>
//                     )}
//                     <button onClick={handleLogout} className="btn btn-outline md:btn-md btn-sm">Logout</button>
//                   </>
//                 ) : (
//                   <>
//                       {/* <button className="btn btn-outline">Login</button> */}
//                       <div className="dropdown dropdown-hover text-white ">
//                         <div tabIndex={0} role="button" className="btn btn-outline m-1 md:btn-md btn-sm">
//                           User
//                         </div>
//                         <ul
//                           tabIndex={0}
//                           className="dropdown-content menu bg-base-100 rounded-box z-[1] gap-1 p-2 shadow"
//                         >
//                           <Link href="/account/user-login" className="text-white ">
//                           <li>
//                             {/* <a>Item 1</a> */}
//                             <button className="btn btn-outline md:btn-md btn-xs">Login</button>
//                           </li>
//                           </Link>
//                           <Link href="/account/user-register" className="text-white ">
//                           <li>
//                             {/* <a>Item 1</a> */}
//                             <button className="btn btn-outline md:btn-md btn-xs">Signup</button>
//                           </li>
//                           </Link>
//                         </ul>
//                       </div>
//                       <div className="dropdown dropdown-hover text-white ">
//                         <div tabIndex={0} role="button" className="btn btn-outline m-1 md:btn-md btn-sm">
//                           Agent
//                         </div>
//                         <ul
//                     tabIndex={0}
//                     className="dropdown-content menu bg-base-100 rounded-box z-[1] gap-1 p-2 shadow "
//                   >
//                     <Link href="/account/agent-login" className="text-white ">
//                     <li>
//                       {/* <a>Item 1</a> */}
//                       <button className="btn btn-outline md:btn-md btn-xs">Login</button>
//                     </li>
//                     </Link>

//                     <Link href="/account/agent-register" className="text-white ">
//                     <li>
//                       {/* <a>Item 1</a> */}
//                       <button className="btn btn-outline md:btn-md btn-xs">Signup</button>
//                     </li>
//                     </Link>
//                         </ul>
//                       </div>
//                   </>
//                 )}
//                </div>

//               {/* Mobile Menu Toggle */}
//               <div className="md:hidden">
//                 <label
//                   htmlFor="navbar-drawer"
//                   className="cursor-pointer text-gray-700"
//                 >
//                   <svg
//                     xmlns="http://www.w3.org/2000/svg"
//                     className="h-6 w-6"
//                     fill="none"
//                     viewBox="0 0 24 24"
//                     stroke="currentColor"
//                   >
//                     <path
//                       strokeLinecap="round"
//                       strokeLinejoin="round"
//                       strokeWidth={2}
//                       d="M4 6h16M4 12h16m-7 6h7"
//                     />
//                   </svg>
//                 </label>
//               </div>
//             </div>
//           </nav>
//         </div>

//         {/* Mobile Drawer */}
//         <div className="drawer-side">
//           <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
//           <ul className="menu p-4 bg-gray-600 rounded w-full items-center">
//             <li>
//               <Link
//                 href={"/"}
//                 onClick={() =>
//                   (document.getElementById("navbar-drawer").checked = false)
//                 }
//               >
//                 {"Home"}
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href={"/about"}
//                 onClick={() =>
//                   (document.getElementById("navbar-drawer").checked = false)
//                 }
//               >
//                 {"About"}
//               </Link>
//             </li>
//             <li>
//               <div className="dropdown relative">
//                 <label
//                   tabIndex={0}
//                   className="cursor-pointer"
//                   onClick={() => setIsDropdownOpen(!isDropdownOpen)}
//                 >
//                   {"Services"}
//                 </label>
//                 {isDropdownOpen && (
//                   <ul
//                     tabIndex={0}
//                     className="menu p-2 shadow bg-gray-300 rounded-box w-full absolute z-50 top-full left-0"
//                   >
//                     <li>
//                       <Link
//                         href={"/will-deed"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Will Deed Form"}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                         href={"/sale-deed"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Sale Deed"}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                         href={"/trust-deed"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Trust Deed Form"}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                         href={"/property-registration"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Property Registration Form"}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                         href={"/property-sale-certificate"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Property Sale Certificate Generator"}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                         href={"/power-of-attorney"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Power of Attorney Form"}
//                       </Link>
//                     </li>
//                     <li>
//                       <Link
//                         href={"/adoption-deed"}
//                         onClick={() =>
//                           (document.getElementById(
//                             "navbar-drawer"
//                           ).checked = false)
//                         }
//                       >
//                         {"Adoption Deed Form"}
//                       </Link>
//                     </li>
//                   </ul>
//                 )}
//               </div>
//             </li>
//             <li>
//               <Link
//                 href={"/contact"}
//                 onClick={() =>
//                   (document.getElementById("navbar-drawer").checked = false)
//                 }
//               >
//                 {"Contact"}
//               </Link>
//             </li>
//             <li>
//               <Link
//                 href={"/will-deed"}
//                 onClick={() =>
//                   (document.getElementById("navbar-drawer").checked = false)
//                 }
//               >
//                 {"Will Deed Form"}
//               </Link>
//             </li>
//           </ul>
//         </div>
//       </div>
//     </>
//   );
// };

// export default Navbar;


"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Loading from "./Loading";
import Cookies from "js-cookie";
import Avatar from "./ui/Avatar";
import AgentAvatar from "./ui/AgentAvatar";

const Navbar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAuth, setIsAuth] = useState(false);
  const [role, setRole] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const readAuth = () => {
      const authLS = typeof window !== 'undefined' ? localStorage.getItem("is_auth") : null;
      setIsAuth(!!authLS);
      const userRole = typeof window !== 'undefined' ? localStorage.getItem("role") : null;
      setRole(userRole);
    };
    readAuth();
    const onStorage = (e) => {
      if (e.key === 'is_auth' || e.key === 'role') readAuth();
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  },[]);

  const handleLogout = () => {
    if (typeof window !== 'undefined'){
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('role');
      localStorage.removeItem('user_email');
      localStorage.removeItem('user_id');
      localStorage.removeItem('is_auth');
    }
    setIsAuth(false);
    setRole(null);
    router.push('/');
  };

  return (
    <>
      {isAuth === null && <Loading />}
      <div className="drawer z-50 sticky top-0">
        <input id="navbar-drawer" type="checkbox" className="drawer-toggle" />
        <div className="drawer-content">
          <nav className="bg-gradient-to-r from-slate-800 via-slate-900 to-slate-800 shadow-lg border-b border-slate-700 backdrop-blur-sm">
            <div className="container mx-auto flex justify-between items-center py-4 px-6">
              {/* Logo Section */}
              <div className="flex items-center space-x-4">
                <Link href={"/"}>
                  <img
                    width="50"
                    height="50"
                    className="w-12 md:w-20 object-contain hover:scale-105 transition-transform duration-300"
                    src="/logo_bg.png"
                    alt="mylogo"
                  />
                </Link>
              </div>

              {/* Navbar Links for Desktop */}
              <div className="hidden md:flex space-x-8">
                <Link
                  href={"/"}
                  className="text-slate-200 hover:text-amber-400 font-medium transition-colors duration-300 relative group"
                >
                  <span className="relative">
                    {"Home"}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>
                <Link
                  href={"/about"}
                  className="text-slate-200 hover:text-amber-400 font-medium transition-colors duration-300 relative group"
                >
                  <span className="relative">
                    {"About"}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>

                {/* Services Dropdown */}
                <div className="dropdown relative">
                  <label
                    tabIndex={0}
                    className="cursor-pointer text-slate-200 hover:text-amber-400 font-medium transition-colors duration-300 relative group"
                  >
                    <span className="relative">
                      {"Services"}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </label>
                  <ul
                    tabIndex={0}
                    className="dropdown-content menu p-3 shadow-xl bg-slate-800 border border-slate-600 rounded-lg w-64 mt-2 absolute z-50"
                  >
                    <li>
                      <Link href={"/will-deed"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Will Deed Form"}
                      </Link>
                    </li>
                    <li>
                      <Link href={"/sale-deed"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Sale Deed Form"}
                      </Link>
                    </li>
                    <li>
                      <Link href={"/trust-deed"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Trust Deed Form"}
                      </Link>
                    </li>
                    <li>
                      <Link href={"/property-registration"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Property Registration Form"}
                      </Link>
                    </li>
                    <li>
                      <Link href={"/property-sale-certificate"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Property Sale Certificate Generator"}
                      </Link>
                    </li>
                    <li>
                      <Link href={"/power-of-attorney"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Power of Attorney Form"}
                      </Link>
                    </li>
                    <li>
                      <Link href={"/adoption-deed"} className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-md px-3 py-2 transition-all duration-200">
                        {"Adoption Deed Form"}
                      </Link>
                    </li>
                  </ul>
                </div>

                <Link
                  href={"/contact"}
                  className="text-slate-200 hover:text-amber-400 font-medium transition-colors duration-300 relative group"
                >
                  <span className="relative">
                    {"Contact"}
                    <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                  </span>
                </Link>

                {/* Dashboard Links - Positioned next to main nav items */}
                {isAuth && role === "user1" && (
                  <Link
                    href="/user/dashboard"
                    className="text-slate-200 hover:text-amber-400 font-medium transition-colors duration-300 relative group"
                  >
                    <span className="relative">
                      {"User Dashboard"}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                )}
                {isAuth && role === "user2" && (
                  <Link
                    href="/agent/dashboard"
                    className="text-slate-200 hover:text-amber-400 font-medium transition-colors duration-300 relative group"
                  >
                    <span className="relative">
                      {"Agent Dashboard"}
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-amber-400 group-hover:w-full transition-all duration-300"></span>
                    </span>
                  </Link>
                )}
              </div>

              <div className="flex items-center space-x-4">
                {isAuth ? (
                  <>
                    {/* Profile Avatar with Dropdown */}
                    {role === "user1" ? (
                      <div className="relative group">
                        <Link href="/user/profile" className="text-slate-200 hover:text-amber-400 mr-4 transition-colors duration-300">
                          <Avatar />
                        </Link>
                        {/* Profile Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-2">
                            <Link href="/user/profile" className="block px-4 py-2 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors duration-200">
                              View Profile
                            </Link>
                            <Link href="/user/dashboard" className="block px-4 py-2 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors duration-200">
                              Dashboard
                            </Link>
                            <hr className="my-2 border-slate-600" />
                            <button 
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-slate-200 hover:text-red-400 hover:bg-slate-700 transition-colors duration-200"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : role === 'user2' ? (
                      <div className="relative group">
                        <Link href="/agent/profile" className="text-slate-200 hover:text-amber-400 mr-4 transition-colors duration-300">
                          <AgentAvatar />
                        </Link>
                        {/* Profile Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-2">
                            <Link href="/agent/profile" className="block px-4 py-2 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors duration-200">
                              View Profile
                            </Link>
                            <Link href="/agent/dashboard" className="block px-4 py-2 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors duration-200">
                              Dashboard
                            </Link>
                            <hr className="my-2 border-slate-600" />
                            <button 
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-slate-200 hover:text-red-400 hover:bg-slate-700 transition-colors duration-200"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : role === 'admin' ? (
                      <div className="relative group">
                        <Link href="/admin/dashboard" className="text-slate-200 hover:text-amber-400 mr-4 transition-colors duration-300">
                          <AgentAvatar />
                        </Link>
                        {/* Profile Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-2">
                            <Link href="/admin/dashboard" className="block px-4 py-2 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors duration-200">
                              Admin Panel
                            </Link>
                            <hr className="my-2 border-slate-600" />
                            <button 
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-slate-200 hover:text-red-400 hover:bg-slate-700 transition-colors duration-200"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="relative group">
                        <Link href={`/${role}/dashboard`} className="text-slate-200 hover:text-amber-400 mr-4 transition-colors duration-300">
                          <AgentAvatar />
                        </Link>
                        {/* Profile Dropdown */}
                        <div className="absolute right-0 top-full mt-2 w-48 bg-slate-800 border border-slate-600 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50">
                          <div className="py-2">
                            <Link href={`/${role}/dashboard`} className="block px-4 py-2 text-slate-200 hover:text-amber-400 hover:bg-slate-700 transition-colors duration-200">
                              Staff Dashboard
                            </Link>
                            <hr className="my-2 border-slate-600" />
                            <button 
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-slate-200 hover:text-red-400 hover:bg-slate-700 transition-colors duration-200"
                            >
                              Logout
                            </button>
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <>
                    <div className="dropdown dropdown-hover">
                      <div tabIndex={0} role="button" className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-slate-600 hover:border-amber-400 text-sm md:text-base">
                        User
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-slate-800 border border-slate-600 rounded-lg z-[1] gap-2 p-3 shadow-xl w-32"
                      >
                         <Link href="/user/login">
                           <li>
                             <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-300 w-full">
                               Login
                             </button>
                           </li>
                         </Link>
                         <Link href="/user/register">
                           <li>
                             <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-300 w-full">
                               Signup
                             </button>
                           </li>
                         </Link>
                      </ul>
                    </div>
                    <div className="dropdown dropdown-hover">
                      <div tabIndex={0} role="button" className="bg-slate-700 hover:bg-slate-600 text-slate-200 px-4 py-2 rounded-lg font-medium transition-all duration-300 border border-slate-600 hover:border-amber-400 text-sm md:text-base">
                        Agent
                      </div>
                      <ul
                        tabIndex={0}
                        className="dropdown-content menu bg-slate-800 border border-slate-600 rounded-lg z-[1] gap-2 p-3 shadow-xl w-32"
                      >
                         <Link href="/agent/login">
                           <li>
                             <button className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-300 w-full">
                               Login
                             </button>
                           </li>
                         </Link>
                         <Link href="/agent/register">
                           <li>
                             <button className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-xs font-medium transition-colors duration-300 w-full">
                               Signup
                             </button>
                           </li>
                         </Link>
                      </ul>
                    </div>
                  </>
                )}
              </div>

              {/* Mobile Menu Toggle */}
              <div className="md:hidden">
                <label
                  htmlFor="navbar-drawer"
                  className="cursor-pointer text-slate-200 hover:text-amber-400 transition-colors duration-300"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16m-7 6h7"
                    />
                  </svg>
                </label>
              </div>
            </div>
          </nav>
        </div>

        {/* Mobile Drawer */}
        <div className="drawer-side">
          <label htmlFor="navbar-drawer" className="drawer-overlay"></label>
          <ul className="menu p-6 bg-slate-800 w-full items-center space-y-3 min-h-full">
            <li>
              <Link
                href={"/"}
                onClick={() =>
                  (document.getElementById("navbar-drawer").checked = false)
                }
                className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
              >
                {"Home"}
              </Link>
            </li>
            <li>
              <Link
                href={"/about"}
                onClick={() =>
                  (document.getElementById("navbar-drawer").checked = false)
                }
                className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
              >
                {"About"}
              </Link>
            </li>
            <li>
              <div className="dropdown relative w-full">
                <label
                  tabIndex={0}
                  className="cursor-pointer text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center block"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  {"Services"}
                </label>
                {isDropdownOpen && (
                  <ul
                    tabIndex={0}
                    className="menu p-3 shadow-xl bg-slate-700 border border-slate-600 rounded-lg w-full mt-2 space-y-1"
                  >
                    <li>
                      <Link
                        href={"/will-deed"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Will Deed Form"}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/sale-deed"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Sale Deed"}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/trust-deed"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Trust Deed Form"}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/property-registration"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Property Registration Form"}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/property-sale-certificate"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Property Sale Certificate Generator"}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/power-of-attorney"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Power of Attorney Form"}
                      </Link>
                    </li>
                    <li>
                      <Link
                        href={"/adoption-deed"}
                        onClick={() =>
                          (document.getElementById(
                            "navbar-drawer"
                          ).checked = false)
                        }
                        className="text-slate-200 hover:text-amber-400 hover:bg-slate-600 rounded-md px-3 py-2 transition-all duration-200"
                      >
                        {"Adoption Deed Form"}
                      </Link>
                    </li>
                  </ul>
                )}
              </div>
            </li>
            <li>
              <Link
                href={"/contact"}
                onClick={() =>
                  (document.getElementById("navbar-drawer").checked = false)
                }
                className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
              >
                {"Contact"}
              </Link>
            </li>
            
            {/* Dashboard Links for Mobile */}
            {isAuth && role === "user1" && (
              <li>
                <Link
                  href="/user/dashboard"
                  onClick={() =>
                    (document.getElementById("navbar-drawer").checked = false)
                  }
                  className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
                >
                  {"User Dashboard"}
                </Link>
              </li>
            )}
            {isAuth && role === "user2" && (
              <li>
                <Link
                  href="/agent/dashboard"
                  onClick={() =>
                    (document.getElementById("navbar-drawer").checked = false)
                  }
                  className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
                >
                  {"Agent Dashboard"}
                </Link>
              </li>
            )}
            {isAuth && role === "admin" && (
              <li>
                <Link
                  href="/admin/dashboard"
                  onClick={() =>
                    (document.getElementById("navbar-drawer").checked = false)
                  }
                  className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
                >
                  {"Admin Panel"}
                </Link>
              </li>
            )}
            {(isAuth && (role === "staff1" || role === "staff2" || role === "staff3" || role === "staff4" || role === "staff5")) && (
              <li>
                <Link
                  href={`/${role}/dashboard`}
                  onClick={() =>
                    (document.getElementById("navbar-drawer").checked = false)
                  }
                  className="text-slate-200 hover:text-amber-400 hover:bg-slate-700 rounded-lg px-4 py-2 transition-all duration-300 w-full text-center"
                >
                  {"Staff Dashboard"}
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </>
  );
};

export default Navbar;
