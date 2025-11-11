import { useEffect, useState } from "react";
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import { useEventBus } from "@/EventBus";
import Modal from "../../../../vendor/laravel/breeze/stubs/inertia-react/resources/js/Components/Modal.jsx";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import { usePage } from "@inertiajs/react";
import UserPicker from "./UserPicker";



export default function GroupModal({ show = false, onClose = () => {} }) {
    const page = usePage();
    const conversations = page.props.conversations;
    const { on , emit } = useEventBus();
    const [group, setGroup] = useState({});
    const {data, setData, post, processing, errors, reset } = useForm({
        id: '',
        name: '',
        description: '',
        users_ids: [],
    });
    const users = conversations.filter((c) => !c.is_group);
    
    const createOrUpdateGroup = (e) => {
        e.preventDefault();
        if (group.id) {
            put(route('group.update', group.id), {
                onSuccess: () => {
                    closeModal();
                    emit('toast.show', `Group ${group.name} updated successfully`);
                },
            });
        } else {
            post(route('group.store'), {
                onSuccess: () => {
                    closeModal();
                    emit('toast.show', `Group ${group.name} created successfully`);
                },
            });
        }
        const closeModal = () => {
            reset();
            onClose();
        };
        useEffect(() => {
            return on("GroupModal.show", (group) => {
                setData({
                    
                    name: group.name,
                    description: group.description,
                    users_ids: group.users.filter((u) => group.owner_id !== u.id).map((u) => u.id),
                });
                setGroup(group);
            });
        }, [on]);
    };
    return (
       <Modal show={show} onClose={onClose}>
            <form 
                onSubmit={createOrUpdateGroup}
                className="p-6 overflow-y-auto"
            >
                <h2 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                    {group.id ? 'Update Group' : 'Create Group'}
                </h2>
                <div className="mt-6">
                    <InputLabel htmlFor="name" value="Name" />
                    <TextInput
                        id="name"
                        type="text"
                        name="name"
                        value={data.name}
                        disabled={!!group.id}
                        required
                        className="mt-1 block w-full"
                        autoComplete="name"
                        isFocused
                        onChange={(e) => setData('name', e.target.value)}
                    />
                    <InputError message={errors.name} className="mt-2" />
                </div>

                <div className="mt-6">
                    <InputLabel htmlFor="description" value="Description" />
                    <TextInput
                        id="description"
                        type="text"
                        name="description"
                        value={data.description || ''}
                        className="mt-1 block w-full"
                        autoComplete="description"
                        onChange={(e) => setData('description', e.target.value)}
                    />
                    <InputError message={errors.description} className="mt-2" />
                </div>

                <div className="mt-6">
                    <InputLabel htmlFor="users_ids" value="Users" />
                    <UserPicker
                        value = {
                            users.filter((u) =>  group.owner_id !== u.id && data.users_ids.includes(u.id)) || []
                        }
                        users={users}
                        onSelected={(users) => setData('users_ids', users.map((u) => u.id))}
                        onChange={(ids) => setData('users_ids', ids)}
                    />
                    <InputError message={errors.users_ids} className="mt-2" />
                </div>


                <div className="mt-6 flex justify-end">
                    <SecondaryButton onClick={onClose}>Cancel</SecondaryButton>
                    <PrimaryButton className="ml-3" disabled={processing}>
                        {group.id ? 'Update' : 'Create'}
                    </PrimaryButton>
                </div>
            </form>
       </Modal>

    )
}
