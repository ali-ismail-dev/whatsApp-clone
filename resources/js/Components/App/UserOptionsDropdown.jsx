import { LockOpenIcon } from "@heroicons/react/24/solid";
import { LockClosedIcon, ShieldCheckIcon, UserIcon,} from "@heroicons/react/24/solid";
import { EllipsisVerticalIcon } from "@heroicons/react/24/solid";
import { Menu, Transition } from "@headlessui/react";
import { Fragment } from "react";
import axios from "axios";
import { useEventBus } from "@/EventBus";

export default function UserOptionsDropdown({ conversation }) {
    const { emit } = useEventBus();
    const changeUserRole = () => {
        if (!conversation.is_user) {
            return;
        }
       axios.post(route('user.changeRole', conversation.id))
        .then(response => {
            
            emit ("toast.show", response.data.message);
            console.log(response.data);
        })
        .catch(error => {
            console.error("There was an error!", error);
        });

    };

   const onBlockUser = () => {
  if (!conversation.is_user) {
    return;
  }


  axios.post(route("user.blockUnBlock", conversation.id))
    .then((response) => {
         console.log("🧪 Block response:", response.data);
    console.log("🧪 Conversation from response:", response.data.conversation);
      emit("toast.show", response.data.message);

      // If the server returns the updated conversation, emit an event so layouts can update
      if (response.data && response.data.conversation) {
        emit("user.blocked", response.data.conversation);
      } else {
        // fallback: emit minimal payload so the listener can react
        emit("user.blocked", { id: conversation.id, blocked_at: response.data.blocked_at ?? new Date().toISOString() });
      }
    })
    .catch((error) => {
      console.error("There was an error blocking/unblocking user!", error);
    });
};


    return (
        <div className="relative inline-block text-left">
            <Menu as="div" className="relative inline-block text-left">
                <div>
                    <Menu.Button className="flex justify-center items-center w-8 h-8 rounded-full hover:bg-black/40">
                        <EllipsisVerticalIcon className="w-5 h-5 text-gray-400" />
                    </Menu.Button>
                </div>
                <Transition
                    as={Fragment}
                    enter="transition ease-out duration-100"
                    enterFrom="transform opacity-0 scale-95"
                    enterTo="transform opacity-100 scale-100"
                    leave="transition ease-in duration-75"
                    leaveFrom="transform opacity-100 scale-100"
                    leaveTo="transform opacity-0 scale-95"
                >
                    <Menu.Items className="absolute right-0 mt-2 w-48 rounded-md bg-gray-800 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none z-10">
                        <div className="py-1 px-1">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={onBlockUser}
                                        className={`${
                                            active ? 'bg-gray-700 text-white' : 'text-gray-300'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        {conversation.blocked_at && (
                                            <>
                                            <LockOpenIcon className="w-5 h-5 mr-2" />
                                            Unblock User
                                            </>
                                        )}
                                        {!conversation.blocked_at && (
                                            <>
                                            <LockClosedIcon className="w-5 h-5 mr-2" />
                                            Block User
                                            </>
                                        )}
                                    </button>
                                )}
                            </Menu.Item>
                        </div>
                        <div className="px-1 py-2">
                            <Menu.Item>
                                {({ active }) => (
                                    <button
                                        onClick={changeUserRole}
                                        className={`${
                                            active ? 'bg-gray-700 text-white' : 'text-gray-300'
                                        } group flex w-full items-center rounded-md px-2 py-2 text-sm`}
                                    >
                                        {conversation.is_admin && (
                                            <>
                                            <UserIcon className="w-5 h-5 mr-2" />
                                            Revoke Admin
                                            </>
                                        )
                                        }

                                    
                                        {!conversation.is_admin && (
                                            <>
                                            <ShieldCheckIcon className="w-5 h-5 mr-2" />
                                            Make Admin
                                            </>
                                        )}
                                    </button>
                                )}
                            </Menu.Item> 

                        </div>
                    </Menu.Items>
                </Transition>
            </Menu>
        </div>
    );
}


                                            