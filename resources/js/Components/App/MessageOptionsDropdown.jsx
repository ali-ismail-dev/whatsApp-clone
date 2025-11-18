import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { ChevronDownIcon, TrashIcon } from "@heroicons/react/24/outline";
import { useEventBus } from "@/EventBus";

export default function MessageOptionsDropdown({ message }) {
  const { emit } = useEventBus();

  const onMessageDelete = () => {
    axios.delete(route("messages.destroy", message.id))
      .then(response => {
        emit("message.deleted", { message, prevMessage: response.data.message });
        console.log(response.data);
      })
      .catch(error => {
        console.error("There was an error!", error);
      });
  };

  return (
    <div className="relative inline-block text-left z-50 pointer-events-auto">
      <Menu as="div" className="relative inline-block text-left">
        <div>
          <Menu.Button className="
            flex justify-center items-center w-8 h-8 
            rounded-xl bg-slate-800 border border-slate-600/50
            transition-all duration-300 
            hover:scale-110 hover:shadow-lg
            text-slate-300 hover:text-cyan-300
            focus:outline-none focus:ring-2 focus:ring-cyan-400/40
            "
          >
            <ChevronDownIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180" />
          </Menu.Button>
        </div>

        <Transition
          as={Fragment}
          enter="transition ease-out duration-200"
          enterFrom="transform opacity-0 scale-95 -translate-y-2"
          enterTo="transform opacity-100 scale-100 translate-y-0"
          leave="transition ease-in duration-150"
          leaveFrom="transform opacity-100 scale-100 translate-y-0"
          leaveTo="transform opacity-0 scale-95 -translate-y-2"
        >
          <Menu.Items className="
            absolute bottom-full right-0 mb-1 w-48 
            rounded-2xl overflow-hidden
            bg-slate-900/100
            /* If you prefer a tiny blur, use backdrop-blur-sm; otherwise remove it */
            /* backdrop-blur-sm */
            shadow-2xl shadow-black/40
            border border-slate-700/80
            focus:outline-none z-50
          ">
            {/* Gradient accent line (keeps visible on opaque background) */}
            <div className="w-full h-1 bg-gradient-to-r from-red-500 to-red-600"></div>

            <div className="py-2 px-2 bg-slate-900">
              <Menu.Item>
                {({ active }) => (
                  <button
                    onClick={onMessageDelete}
                    className={`
                      group flex w-full items-center rounded-xl px-3 py-3 text-sm
                      transition-all duration-200
                      ${active
                        ? 'bg-gradient-to-r from-red-600/20 to-red-500/20 text-white border border-red-600/25'
                        : 'text-slate-200'
                      }
                      hover:scale-[1.02] hover:shadow-md
                    `}
                  >
                    <div className={`
                      p-2 rounded-lg mr-3 transition-all duration-200
                      ${active
                        ? 'bg-red-500/20 text-red-400'
                        : 'bg-slate-700 text-slate-400 group-hover:text-red-400 group-hover:bg-red-500/10'
                      }
                    `}>
                      <TrashIcon className="w-4 h-4" />
                    </div>
                    <span className="font-medium">Delete Message</span>

                    <div className={`
                      ml-auto w-2 h-2 rounded-full bg-red-500
                      transition-all duration-200
                      ${active ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}
                    `}></div>
                  </button>
                )}
              </Menu.Item>
            </div>

            {/* Decorative footer - make it opaque to match the menu */}
            <div className="px-3 py-2 border-t border-slate-700 bg-slate-900">
              <p className="text-xs text-slate-500 text-center">
                This action cannot be undone
              </p>
            </div>
          </Menu.Items>
        </Transition>
      </Menu>
    </div>
  );
}
