import { useState } from "react";
import { FiChevronRight } from "react-icons/fi"; 

const ProfileSuggetions = () => {
  const profileSuggestions = [
    { id: 1, name: "John Doe", username: "@johndoe", profileImage: "https://via.placeholder.com/150" },
    { id: 2, name: "Jane Smith", username: "@janesmith", profileImage: "https://via.placeholder.com/150" },
    { id: 3, name: "Emily Johnson", username: "@emilyjohnson", profileImage: "https://via.placeholder.com/150" },
    { id: 4, name: "Mike Brown", username: "@mikebrown", profileImage: "https://via.placeholder.com/150" },
    { id: 5, name: "Sarah Lee", username: "@sarahlee", profileImage: "https://via.placeholder.com/150" },
  ];

  const [expanded, setExpanded] = useState(false); // State to control expansion of profile list

  return (
    <div className="w-64 bg-white shadow-md rounded-lg p-4 text-black inline-block">
      <h2 className="text-lg font-bold mb-4">Suggestions</h2>

      {/* Profile list */}
      <ul>
        {profileSuggestions.slice(0, expanded ? profileSuggestions.length : 3).map((profile) => (
          <li key={profile.id} className="flex items-center space-x-3 py-2">
            <img src={profile.profileImage} alt={profile.name} className="w-10 h-10 rounded-full" />
            <div>
              <h3 className="font-semibold">{profile.name}</h3>
              <p className="text-gray-500">{profile.username}</p>
            </div>
          </li>
        ))}
      </ul>

      {/* View more button */}
      {profileSuggestions.length > 3 && (
        <button
          className="mt-4 text-black flex items-center"
          onClick={() => setExpanded(!expanded)}
        >
          {expanded ? "Show less" : "Show more"}
          <FiChevronRight className={`ml-2 ${expanded ? "transform rotate-90" : ""}`} />
        </button>
      )}
    </div>
  );
};

export default ProfileSuggetions;
