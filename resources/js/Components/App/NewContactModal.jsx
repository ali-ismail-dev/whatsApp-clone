// resources/js/Components/App/NewContactModal.jsx
import { useForm } from "@inertiajs/react";
import InputError from "../InputError";
import InputLabel from "../InputLabel";
import TextInput from "../TextInput";
import { useEventBus } from "@/EventBus";
import Modal from "@/Components/Modal";
import SecondaryButton from "../SecondaryButton";
import PrimaryButton from "../PrimaryButton";
import axios from "axios";
import { useState } from "react";
import { UserPlusIcon } from "@heroicons/react/24/outline";

export default function NewContactModal({ show = false, onClose = () => {} }) {
  const { emit } = useEventBus();

  // Keep useForm for convenient data binding and reset
  const { data, setData, reset } = useForm({
    name: "",
    email: "",
  });

  // local errors (so we can show field errors when using axios)
  const [errors, setErrors] = useState({});
  const [processing, setProcessing] = useState(false);

  // Helper to close modal and reset form
  const closeModal = () => {
    reset();
    setErrors({});
    setProcessing(false);
    onClose();
  };

  // Submit: use axios so we can read JSON body and status codes directly
  const submit = async (e) => {
    e.preventDefault();
    setProcessing(true);

    // client guard
    if (!data.name?.trim() || !data.email?.trim()) {
      emit("toast.show", { message: "Name and email are required", type: "error" });
      setProcessing(false);
      return;
    }

    // show a transient UI clue that request is being sent
    emit("toast.show", { message: "Sending request...", type: "info", loading: true });

    try {
      const response = await axios.post(route("contacts.store"), {
        name: data.name,
        email: data.email,
      });

      // Successful HTTP response (200, maybe used for info/success messages)
      const msg = response?.data?.message || "Done";

      // Decide toast type — treat "already" / "pending" text as info
      const lower = String(msg).toLowerCase();
      const type = lower.includes("already") || lower.includes("pending") ? "info" : "success";

      emit("toast.show", { message: msg, type });

      // Notify other UI pieces (sidebar, notifications) that request was sent
      emit("contact.request.sent", { email: data.email, name: data.name });

      // Close modal after a short delay so toast has time to register
      setTimeout(() => closeModal(), 120);
    } catch (err) {
      // Axios errors: handle validation (422) and other statuses
      if (err.response) {
        const status = err.response.status;
        const body = err.response.data || {};

        if (status === 422) {
          // Validation errors: body.errors is expected
          const serverErrors = body.errors || {};
          // Flatten to first message per field for InputError
          const flattened = Object.keys(serverErrors).reduce((acc, key) => {
            const val = serverErrors[key];
            acc[key] = Array.isArray(val) ? val[0] : val;
            return acc;
          }, {});
          setErrors(flattened);

          // Show a short toast as well
          emit("toast.show", { message: "Request failed", type: "error" });
          setProcessing(false);
          return;
        }

        // Known application message (e.g., 404 user not found, 409 conflict)
        const msg = body.message || "Request failed";
        const t = status >= 500 ? "error" : (status === 404 ? "error" : (status === 409 ? "info" : "info"));
        emit("toast.show", { message: msg, type: t });
        setProcessing(false);
        return;
      }

      // Network / unknown error
      console.error("Contact request failed", err);
      emit("toast.show", { message: "Request failed", type: "error" });
      setProcessing(false);
    }
  };

  return (
    <Modal show={show} onClose={closeModal}>
      <div className="
        bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800
        border border-slate-700/50 rounded-2xl
        backdrop-blur-xl shadow-2xl shadow-blue-500/10
        overflow-hidden
      ">
        {/* Gradient header bar */}
        <div className="bg-gradient-to-r from-blue-500 to-cyan-500 h-1 w-full"></div>
        
        <form onSubmit={submit} className="p-6 overflow-y-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-r from-blue-500/20 to-cyan-500/20 rounded-xl backdrop-blur-sm">
              <UserPlusIcon className="w-6 h-6 text-cyan-400" />
            </div>
            <h2 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">
              Add New Contact
            </h2>
          </div>

          <p className="text-sm text-slate-400 mt-2 leading-relaxed">
            Provide a display name and the email address of the user you want to connect with on the platform.
          </p>

          <div className="mt-6">
            <InputLabel 
              htmlFor="name" 
              value="Display Name" 
              className="text-slate-200 font-medium"
            />
            <TextInput
              id="name"
              type="text"
              name="name"
              value={data.name}
              required
              className="mt-2 block w-full
                bg-slate-700/50 border-slate-600/50
                text-slate-200 placeholder-slate-400
                focus:border-blue-500 focus:ring-blue-500/20
                transition-all duration-300
                rounded-xl backdrop-blur-sm
              "
              autoComplete="name"
              isFocused
              onChange={(e) => {
                setData("name", e.target.value);
                if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
              }}
            />
            <InputError message={errors.name} className="mt-2" />
          </div>

          <div className="mt-6">
            <InputLabel 
              htmlFor="email" 
              value="Email Address" 
              className="text-slate-200 font-medium"
            />
            <TextInput
              id="email"
              type="email"
              name="email"
              value={data.email}
              className="mt-2 block w-full
                bg-slate-700/50 border-slate-600/50
                text-slate-200 placeholder-slate-400
                focus:border-cyan-500 focus:ring-cyan-500/20
                transition-all duration-300
                rounded-xl backdrop-blur-sm
              "
              onChange={(e) => {
                setData("email", e.target.value);
                if (errors.email) setErrors((prev) => ({ ...prev, email: undefined }));
              }}
              required
            />
            <InputError message={errors.email} className="mt-2" />
          </div>

          <div className="mt-8 flex justify-end space-x-3">
            <SecondaryButton 
              onClick={closeModal}
              className="
                bg-slate-700/50 border-slate-600/50
                text-slate-300 hover:bg-slate-600/50
                backdrop-blur-sm transition-all duration-300
                hover:scale-105
              "
              disabled={processing}
            >
              Cancel
            </SecondaryButton>
            <PrimaryButton 
              type="submit"
              disabled={processing}
              className="
                bg-gradient-to-r from-blue-500 to-cyan-500
                hover:from-blue-600 hover:to-cyan-600
                text-white font-medium
                transition-all duration-300
                hover:scale-105 hover:shadow-lg hover:shadow-blue-500/25
                disabled:opacity-50 disabled:scale-100
                backdrop-blur-sm
              "
            >
              {processing ? (
                <div className="flex items-center">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2"></div>
                  Sending...
                </div>
              ) : (
                <div className="flex items-center">
                  <UserPlusIcon className="w-4 h-4 mr-2" />
                  Send Request
                </div>
              )}
            </PrimaryButton>
          </div>

          {/* Help text */}
          <div className="mt-6 p-3 bg-slate-700/30 rounded-xl border border-slate-600/50">
            <p className="text-xs text-slate-400 text-center">
              The user will receive a contact request and can accept it to start chatting
            </p>
          </div>
        </form>
      </div>
    </Modal>
  );
}