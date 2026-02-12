import { useState } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [notifying, setNotifying] = useState(true);

  function toggleDropdown() {
    setIsOpen(!isOpen);
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  const handleClick = () => {
    toggleDropdown();
    setNotifying(false);
  };
  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-all duration-300 bg-white border-2 border-gray-200 rounded-full dropdown-toggle hover:text-brand-600 h-11 w-11 hover:bg-linear-to-br hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-300 hover:scale-105 hover:shadow-lg hover:shadow-brand-500/20 active:scale-95 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-brand-400 dark:hover:border-brand-700"
        onClick={handleClick}
      >
        <span
          className={`absolute right-0 top-0.5 z-10 h-2.5 w-2.5 rounded-full bg-linear-to-r from-orange-400 to-orange-500 shadow-lg shadow-orange-500/50 ${
            !notifying ? "hidden" : "flex"
          }`}
        >
          <span className="absolute inline-flex w-full h-full bg-orange-400 rounded-full opacity-75 animate-ping"></span>
        </span>
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0809 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>
      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-3 flex h-[520px] w-[380px] flex-col rounded-3xl border-2 border-gray-200/60 bg-white/95 backdrop-blur-xl p-4 shadow-2xl shadow-brand-500/10 dark:border-gray-800/60 dark:bg-gray-dark/95 sm:w-[400px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-4 mb-4 border-b-2 border-gradient-to-r from-brand-500/10 via-brand-500/5 to-transparent">
          <h5 className="text-xl font-bold text-transparent bg-linear-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-300 bg-clip-text">
            Notifications
          </h5>
          <button
            onClick={toggleDropdown}
            className="flex items-center justify-center w-8 h-8 text-gray-500 transition-all duration-300 rounded-xl hover:bg-linear-to-br hover:from-gray-100 hover:to-gray-50 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 hover:scale-110 active:scale-95 dark:hover:bg-gray-800/50"
          >
            <svg
              className="fill-current"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.21967 7.28131C5.92678 6.98841 5.92678 6.51354 6.21967 6.22065C6.51256 5.92775 6.98744 5.92775 7.28033 6.22065L11.999 10.9393L16.7176 6.22078C17.0105 5.92789 17.4854 5.92788 17.7782 6.22078C18.0711 6.51367 18.0711 6.98855 17.7782 7.28144L13.0597 12L17.7782 16.7186C18.0711 17.0115 18.0711 17.4863 17.7782 17.7792C17.4854 18.0721 17.0105 18.0721 16.7176 17.7792L11.999 13.0607L7.28033 17.7794C6.98744 18.0722 6.51256 18.0722 6.21967 17.7794C5.92678 17.4865 5.92678 17.0116 6.21967 16.7187L10.9384 12L6.21967 7.28131Z"
                fill="currentColor"
              />
            </svg>
          </button>
        </div>
        <ul className="flex flex-col h-auto overflow-y-auto premium-scrollbar space-y-2">
          {/* Example notification items */}
          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-02.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block text-sm text-gray-600 dark:text-gray-400 space-x-1">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Terry Franci
                  </span>
                  <span> requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>5 min ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-03.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Alena Franci
                  </span>
                  <span>requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>8 min ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-04.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Jocelyn Kenter
                  </span>
                  <span> requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>15 min ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
              to="/"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-05.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-error-500 to-error-600 shadow-lg shadow-error-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 space-x-1 block text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Brandon Philips
                  </span>
                  <span>requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>1 hr ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
              onItemClick={closeDropdown}
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-02.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Terry Franci
                  </span>
                  <span> requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>5 min ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-03.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Alena Franci
                  </span>
                  <span> requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>8 min ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-04.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-success-500 to-success-600 shadow-lg shadow-success-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block  space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Jocelyn Kenter
                  </span>
                  <span> requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>15 min ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>

          <li>
            <DropdownItem
              onItemClick={closeDropdown}
              className="flex gap-3.5 rounded-xl border border-gray-100 p-4 hover:bg-linear-to-r hover:from-brand-50 hover:to-brand-100/50 hover:border-brand-200 hover:shadow-md hover:translate-x-1 transition-all duration-300 dark:border-gray-800 dark:hover:bg-linear-to-r dark:hover:from-brand-900/20 dark:hover:to-brand-800/10 dark:hover:border-brand-700/50"
            >
              <span className="relative block w-full h-12 rounded-full z-1 max-w-12 ring-2 ring-brand-200 ring-offset-2">
                <img
                  width={48}
                  height={48}
                  src="/images/user/user-05.jpg"
                  alt="User"
                  className="w-full overflow-hidden rounded-full"
                />
                <span className="absolute bottom-0 right-0 z-10 h-3 w-full max-w-3 rounded-full border-2 border-white bg-linear-to-r from-error-500 to-error-600 shadow-lg shadow-error-500/50 dark:border-gray-900"></span>
              </span>

              <span className="flex-1 block">
                <span className="mb-2 block space-x-1 text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-semibold text-gray-900 dark:text-white">
                    Brandon Philips
                  </span>
                  <span>requests permission to change</span>
                  <span className="font-semibold text-brand-600 dark:text-brand-400">
                    Project - Nganter App
                  </span>
                </span>

                <span className="flex items-center gap-2.5 text-gray-500 text-xs dark:text-gray-400">
                  <span className="font-medium">Project</span>
                  <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                  <span>1 hr ago</span>
                </span>
              </span>
            </DropdownItem>
          </li>
          {/* Add more items as needed */}
        </ul>
        <Link
          to="/"
          className="block px-5 py-3.5 mt-4 text-sm font-semibold text-center text-white bg-linear-to-r from-brand-500 to-brand-600 border-2 border-transparent rounded-xl hover:from-brand-600 hover:to-brand-700 hover:shadow-lg hover:shadow-brand-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 dark:from-brand-600 dark:to-brand-700 dark:hover:from-brand-500 dark:hover:to-brand-600"
        >
          View All Notifications
        </Link>
      </Dropdown>
    </div>
  );
}
