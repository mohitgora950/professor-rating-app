/* ============================================================
   js/data.js  —  Clean + Randomized Professor Data
   ============================================================ */

// Department Colors
const DEPT_COLORS = {
  CSE: "#60a5fa",
  ECE: "#34d399",
  HBS: "#f97316"
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_GLOW   = ["rgba(255,215,0,0.3)", "rgba(192,192,192,0.2)", "rgba(205,127,50,0.2)"];

// 🔥 ORIGINAL DATA (keep as is)
const PROFESSORS_DATA = [
  { id: 1, dept: "CSE", rating: 4.0, lastSemRating: 4.0, totalRatings: 98 },
  { id: 2, dept: "ECE", rating: 4.7, lastSemRating: 4.7, totalRatings: 143 },
  { id: 3, dept: "ECE", rating: 4.5, lastSemRating: 4.5, totalRatings: 121 },
  { id: 4, dept: "ECE", rating: 4.4, lastSemRating: 4.4, totalRatings: 109 },
  { id: 5, dept: "CSE", rating: 4.8, lastSemRating: 4.8, totalRatings: 187 },
  { id: 6, dept: "HBS", rating: 4.3, lastSemRating: 4.3, totalRatings: 88 },
  { id: 7, dept: "CSE", rating: 4.5, lastSemRating: 4.5, totalRatings: 134 },
  { id: 8, dept: "ECE", rating: 4.9, lastSemRating: 4.9, totalRatings: 312 },
  { id: 9, dept: "ECE", rating: 4.4, lastSemRating: 4.4, totalRatings: 102 },
  { id: 10, dept: "CSE", rating: 4.6, lastSemRating: 4.6, totalRatings: 156 },
  { id: 11, dept: "ECE", rating: 4.9, lastSemRating: 4.7, totalRatings: 119 },
  { id: 12, dept: "ECE", rating: 4.3, lastSemRating: 4.3, totalRatings: 87 },
  { id: 13, dept: "CSE", rating: 4.8, lastSemRating: 4.8, totalRatings: 201 },
  { id: 14, dept: "HBS", rating: 4.5, lastSemRating: 4.5, totalRatings: 96 },
  { id: 15, dept: "ECE", rating: 4.4, lastSemRating: 4.4, totalRatings: 98 },
  { id: 16, dept: "ECE", rating: 4.5, lastSemRating: 4.5, totalRatings: 112 },
  { id: 17, dept: "CSE", rating: 4.7, lastSemRating: 4.7, totalRatings: 144 },
  { id: 18, dept: "ECE", rating: 4.6, lastSemRating: 4.6, totalRatings: 131 },
  { id: 19, dept: "CSE", rating: 3.0, lastSemRating: 3.0, totalRatings: 76 },
  { id: 20, dept: "CSE", rating: 4.3, lastSemRating: 4.3, totalRatings: 68 },
  { id: 21, dept: "HBS", rating: 4.6, lastSemRating: 4.6, totalRatings: 85 },
  { id: 22, dept: "CSE", rating: 4.8, lastSemRating: 4.8, totalRatings: 120 },
  { id: 23, dept: "ECE", rating: 4.5, lastSemRating: 4.5, totalRatings: 95 },
  { id: 24, dept: "HBS", rating: 4.4, lastSemRating: 4.4, totalRatings: 78 },
  { id: 25, dept: "CSE", rating: 4.7, lastSemRating: 4.7, totalRatings: 142 },
  { id: 26, dept: "ECE", rating: 4.9, lastSemRating: 4.9, totalRatings: 156 }
];

// ================= HELPERS =================

function getAlphabetName(index) {
  return String.fromCharCode(65 + index); // A, B, C...
}

function getRandomEmail(name, id) {
  return `${name.toLowerCase()}${id}@gmail.com`;
}

function getRandomImage(id) {
  // 2 Indian female professionals + rest Indian male professionals
  const indianProfessionalPhotos = {
    female: [
      "https://tse1.explicit.bing.net/th/id/OIP.ChAurE_dse9Q8luoLJadxQAAAA?w=417&h=626&rs=1&pid=ImgDetMain&o=7&rm=3", // Indian woman 1
      "https://media.istockphoto.com/id/1330255708/photo/portrait-of-smiling-teacher-in-school-corridor-with-books-in-hand.jpg?b=1&s=170667a&w=0&k=20&c=Zk_djawJL9o6NvUwg7d0CCt-kPnRLRO1Q3OEGLjJ1xM="  // Indian woman 2
    ],
    male: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1517070213202-1f374562b861?w=400&h=400&fit=crop",
      "https://tse3.mm.bing.net/th/id/OIP.oreU6G7VIW77oxGLqskGAwHaE_?rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      "https://dux7id0k7hacn.cloudfront.net/as/assets-mem-com/cmi/5/2/9/7/11857925/20240618_164158708_0_orig.jpg/-/tarun-mukherjee-new-orleans-la-obituary.jpg?maxheight=650",
      "https://images.unsplash.com/photo-1517070213202-1f374562b861?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1534528741775-53a8323c8ee0?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop",
      "https://i1.rgstatic.net/ii/profile.image/272272472670245-1441926224990_Q512/Mohammed-Atiquzzaman.jpg",
      "https://assets.lybrate.com/img/documents/doctor/dp/698a1b4624c8c5a097c24d864812163c/Ear-Nose-Throat-ENT--PinakiMazumder-Kolkata-bc4204.JPG",
      "https://tse2.mm.bing.net/th/id/OIP.HjN1yjkhhMUfOgVHud4M3AHaHa?w=528&h=528&rs=1&pid=ImgDetMain&o=7&rm=3",
      "https://civil.iitm.ac.in/admin/civilcont/Slide7.JPG",
      "https://img.lb.wbmdstatic.com/lhd/provider/548549_5279b592-56e3-4121-a840-35b861c53e02.jpg",
      "https://media.istockphoto.com/id/1194297864/photo/portrait-of-a-happy-man-of-indian-origin.jpg?s=612x612&w=0&k=20&c=qFUht93DAnNo9_vJ2Sf3D2wYg3ZWdhMnQzBRH9Mwb1A=",
      "https://media.istockphoto.com/photos/portrait-of-a-cheering-man-of-indian-ethnicity-holding-books-picture-id1212172498?k=20&m=1212172498&s=612x612&w=0&h=1HqkgqNyytA3WBsYSjUo_TOEUJUW8ikqP-Tbec6YcUw="
    ]
  };
  
  // First 2 professors are female
  if (id <= 2) {
    return indianProfessionalPhotos.female[id - 1];
  }
  
  // Rest are male
  const maleIndex = (id - 3) % indianProfessionalPhotos.male.length;
  return indianProfessionalPhotos.male[maleIndex];
}

const RANDOM_ACHIEVEMENTS = [
  "PhD from IIT Delhi",
  "Published research papers",
  "Expert in Artificial Intelligence",
  "Worked on Government projects",
  "Specialist in Machine Learning",
  "Guest lecturer internationally",
  "Research in Deep Learning",
  "Expert in Data Science"
];

const RANDOM_INTERESTS = [
  "AI, ML, Data Science",
  "Web Development",
  "Cyber Security",
  "Cloud Computing",
  "Signal Processing",
  "Mathematics Modeling"
];

function getRandomAchievements() {
  return Array.from({ length: 3 }, () =>
    RANDOM_ACHIEVEMENTS[Math.floor(Math.random() * RANDOM_ACHIEVEMENTS.length)]
  );
}

function getRandomInterest() {
  return RANDOM_INTERESTS[Math.floor(Math.random() * RANDOM_INTERESTS.length)];
}

function getRandomLink(type, id) {
  return `https://${type}.com/user${id}`;
}

// ================= MAIN DATA CLEAN =================

function anonymizeProfessorsData(data) {
  return data.map((prof, index) => {
    const name = getAlphabetName(index);

    return {
      ...prof,
      name,
      subject: "Subject " + (index + 1),

      email: getRandomEmail(name, prof.id),
      phone: "+91 9" + Math.floor(100000000 + Math.random() * 900000000),

      image: getRandomImage((index % 70) + 1),

      achievements: getRandomAchievements(),
      interests: getRandomInterest(),

      linkedin: getRandomLink("linkedin", prof.id),
      instagram: getRandomLink("instagram", prof.id),
      facebook: getRandomLink("facebook", prof.id),

      feedback: []
    };
  });
}

// 🔥 FINAL DATA
const CLEANED_DATA = anonymizeProfessorsData(PROFESSORS_DATA);

// Update PROFESSORS_DATA with cleaned data containing names, emails, etc.
PROFESSORS_DATA.forEach((prof, idx) => {
  Object.assign(prof, CLEANED_DATA[idx]);
});

// ================= UTIL FUNCTIONS =================

function getInitials(name) {
  return name.slice(0, 2);
}

function getSortedProfessors(profsArr) {
  return [...profsArr].sort((a, b) => b.lastSemRating - a.lastSemRating);
}

function buildAvatarImg(prof, size, borderColor) {
  const dc = DEPT_COLORS[prof.dept] || "#c084fc";

  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    width:${size}px;
    height:${size}px;
    border-radius:50%;
    border:3px solid ${borderColor};
    overflow:hidden;
    background:#111;
    display:flex;
    align-items:center;
    justify-content:center;
  `;

  const img = document.createElement("img");
  img.src = prof.image;
  img.style.cssText = "width:100%;height:100%;object-fit:cover";

  img.onerror = function () {
    wrapper.innerHTML = `<span style="color:${dc};font-size:${size * 0.4}px">${getInitials(prof.name)}</span>`;
  };

  wrapper.appendChild(img);
  return wrapper;
}