"use client";

const LogoutButton = () => {
  return (
    <form>
      <button
        type="submit"
        className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600 transition"
      >
        Logout
      </button>
    </form>
  );
};

export default LogoutButton;
