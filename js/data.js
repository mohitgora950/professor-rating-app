/* ============================================================
   js/data.js  —  All professor data + helper constants
   ============================================================ */

const DEPT_COLORS = {
  CSE: "#60a5fa",
  ECE: "#34d399",
  HBS: "#f97316"
};

const RANK_MEDALS = ["🥇", "🥈", "🥉"];
const RANK_COLORS = ["#FFD700", "#C0C0C0", "#CD7F32"];
const RANK_GLOW   = ["rgba(255,215,0,0.3)", "rgba(192,192,192,0.2)", "rgba(205,127,50,0.2)"];

const PROFESSORS_DATA = [
  {
    id: 1, name: "Dr. Akoijam Malemnganbi", dept: "HBS",
    subject: "English Language Teaching",
    image: "https://www.iiitmanipur.ac.in/img/staff/Malemnganbi.jpeg",
    rating: 5.0, lastSemRating: 5.0, topPerformer: true,
    email: "akoijam@iiitmanipur.ac.in", phone: "+91 98765 10001",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from University of Hyderabad, India",
      "Assistant Professor, HBS Department",
      "Expert in Translation Studies & Human Language Technology",
      "Research in Entrepreneurial Communications and Cultural Studies"
    ],
    interests: "Translation Studies, Human Language Technology, Entrepreneurial Communications and Cultural Studies",
    totalRatings: 98, feedback: []
  },
  {
    id: 2, name: "Dr. Anup Dey", dept: "ECE",
    subject: "Nanoelectronic Devices",
    image: "https://www.iiitmanipur.ac.in/img/staff/Anup.png",
    rating: 4.7, lastSemRating: 4.7, topPerformer: false,
    email: "anupece@iiitmanipur.ac.in", phone: "+91 98765 10002",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post-Doc from University of Manitoba, Winnipeg, Canada",
      "PhD from Jadavpur University, Kolkata, India",
      "Assistant Professor, ECE Department",
      "Expert in ISFET, Gas Sensing, Graphene, CNT/MWCNT, Solar cells"
    ],
    interests: "Nanoelectronic devices, ISFET, Gas Sensing Applications, QDs, Biosensors, Graphene, CNT/MWCNT, Solar cells",
    totalRatings: 143, feedback: []
  },
  {
    id: 3, name: "Dr. Dilip Singh", dept: "ECE",
    subject: "VLSI Design & FPGA",
    image: "https://www.iiitmanipur.ac.in/img/staff/dilip.jpg",
    rating: 4.5, lastSemRating: 4.5, topPerformer: false,
    email: "dilip@iiitmanipur.ac.in", phone: "+91 98765 10003",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post doc @ IIT Madras",
      "PhD from NIT Hamirpur, India",
      "Assistant Professor, ECE Department",
      "Expert in Hardware acceleration, VLSI design, FPGA-based system design"
    ],
    interests: "Hardware acceleration, VLSI design, Speech coding, and FPGA-based system design",
    totalRatings: 121, feedback: []
  },
  {
    id: 4, name: "Dr. Enukonda Venkata Pothan", dept: "ECE",
    subject: "Wireless Communication",
    image: "https://www.iiitmanipur.ac.in/img/staff/EV%20pothan.jpg",
    rating: 4.4, lastSemRating: 4.4, topPerformer: false,
    email: "pothan@iiitmanipur.ac.in", phone: "+91 98765 10004",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from IIT Guwahati, India",
      "Assistant Professor, ECE Department",
      "Specialist in massive MIMO systems",
      "Research in UAV communication systems"
    ],
    interests: "Wireless communication networks, cell-free massive MIMO, underlay spectrum sharing, UAV communication",
    totalRatings: 109, feedback: []
  },
  {
    id: 5, name: "Dr. Jennil Thiyam", dept: "CSE",
    subject: "Machine Learning & AI",
    image: "https://www.iiitmanipur.ac.in/img/staff/jennil.png",
    rating: 4.8, lastSemRating: 4.8, topPerformer: false,
    email: "jennil@iiitmanipur.ac.in", phone: "+91 98765 10005",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post doc @ ISS, Academia Sinica, Taiwan",
      "PhD from IIT Guwahati, India",
      "Assistant Professor, CSE Department",
      "Expert in Computer Vision, OCR, Deep learning"
    ],
    interests: "Computer vision, OCR, NLP, Representation learning, Deep learning, Machine Learning",
    totalRatings: 187, feedback: []
  },
  {
    id: 6, name: "Dr. Kamalesh Kumar", dept: "HBS",
    subject: "Computational Mathematics",
    image: "https://www.iiitmanipur.ac.in/img/staff/kamlesh.jpg",
    rating: 4.3, lastSemRating: 4.3, topPerformer: false,
    email: "kamalesh@iiitmanipur.ac.in", phone: "+91 98765 10006",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from Visvesvaraya NIT, Nagpur, India",
      "Assistant Professor, HBS Department",
      "Expert in Singularly Perturbed Differential Equations",
      "Research in Numerical Analysis"
    ],
    interests: "Numerical Analysis, Singularly Perturbed Differential Equations, Computational Mathematics",
    totalRatings: 88, feedback: []
  },
  {
    id: 7, name: "Dr. Khoirom Motilal Singh", dept: "CSE",
    subject: "Information Security & Cryptography",
    image: "https://www.iiitmanipur.ac.in/img/staff/motilal.jpg",
    rating: 4.5, lastSemRating: 4.5, topPerformer: false,
    email: "motilal@iiitmanipur.ac.in", phone: "+91 98765 10007",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NIT, Nagaland, India",
      "Assistant Professor, CSE Department",
      "Expert in Cryptanalysis and Cryptography",
      "Research in Information Security"
    ],
    interests: "Information Security, Cryptanalysis and Cryptography",
    totalRatings: 134, feedback: []
  },
  {
    id: 8, name: "Prof. Krishnan Baskar", dept: "ECE",
    subject: "Semiconductor Devices",
    image: "https://www.iiitmanipur.ac.in/img/staff/director.jpg",
    rating: 4.9, lastSemRating: 4.9, topPerformer: false,
    email: "director@iiitmanipur.ac.in", phone: "+91 98765 10008",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "D.Sc. KTH, Sweden",
      "Post-Doc @ Nagoya Institute of Technology, Japan (1995-1999)",
      "Post-Doc @ KTH, Stockholm, Sweden (2001-2004)",
      "PhD from Anna University, India",
      "Director, IIIT Manipur"
    ],
    interests: "Semiconductor Material and Devices",
    totalRatings: 312, feedback: []
  },
  {
    id: 9, name: "Dr. Nagesh Ch", dept: "ECE",
    subject: "VLSI & MEMS",
    image: "https://www.iiitmanipur.ac.in/img/staff/nagesh.png",
    rating: 4.4, lastSemRating: 4.4, topPerformer: false,
    email: "nagesh@iiitmanipur.ac.in", phone: "+91 98765 10009",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from IIT Guwahati, India",
      "Assistant Professor, ECE Department",
      "Research in SAW Devices for Biomedical Applications",
      "Expert in VLSI & MEMS technologies"
    ],
    interests: "VLSI, MEMS & SAW Devices for Biomedical Applications",
    totalRatings: 102, feedback: []
  },
  {
    id: 10, name: "Dr. Navanath Saharia", dept: "CSE",
    subject: "Natural Language Processing",
    image: "https://www.iiitmanipur.ac.in/img/staff/nsaharia.jpg",
    rating: 4.6, lastSemRating: 4.6, topPerformer: false,
    email: "nsaharia@iiitmanipur.ac.in", phone: "+91 98765 10010",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from Tezpur University, India",
      "Assistant Professor, CSE Department",
      "Expert in Social Networks Content Analysis",
      "Research in Natural Language Processing"
    ],
    interests: "Social Networks Content Analysis, Natural Language Processing",
    totalRatings: 156, feedback: []
  },
  {
    id: 11, name: "Dr. Ngasepam Monica Devi", dept: "ECE",
    subject: "Thin Films & Photodetectors",
    image: "https://www.iiitmanipur.ac.in/img/staff/monica.jpg",
    rating: 4.9, lastSemRating: 4.7, topPerformer: false,
    email: "monica@iiitmanipur.ac.in", phone: "+91 98765 10011",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NIT, Nagaland, India",
      "Assistant Professor, ECE Department",
      "Expert in Device fabrication of thin films & 1D structures",
      "Research in photodetectors & solar cells"
    ],
    interests: "Device fabrication of thin films & 1D structures and characterization based on photodetectors & solar cells",
    totalRatings: 119, feedback: []
  },
  {
    id: 12, name: "Dr. D. Neelamegam", dept: "ECE",
    subject: "Hyperspectral Imaging & Drones",
    image: "https://www.iiitmanipur.ac.in/img/staff/neelamegam.jpeg",
    rating: 4.3, lastSemRating: 4.3, topPerformer: false,
    email: "neelamegam@iiitmanipur.ac.in", phone: "+91 98765 10012",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from Pondicherry University, INDIA",
      "Assistant Professor, ECE Department",
      "Expert in Non-Destructive Sensing using Spectroscopic Techniques",
      "Research in Drone Technology & Hyperspectral Imaging"
    ],
    interests: "Non-Destructive Sensing Systems using Spectroscopic Techniques, Hyperspectral Imaging and Processing Techniques, Drone Technology",
    totalRatings: 87, feedback: []
  },
  {
    id: 13, name: "Dr. Nongmeikapam Kishorjit Singh", dept: "CSE",
    subject: "AI & Machine Learning",
    image: "https://www.iiitmanipur.ac.in/img/staff/Kishorjit.jpg",
    rating: 4.8, lastSemRating: 4.8, topPerformer: false,
    email: "kishorjit@iiitmanipur.ac.in", phone: "+91 98765 10013",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from Jadavpur University, India",
      "Assistant Professor, CSE Department",
      "Expert in NLP, Image Processing, Soft Computing",
      "Research in AI & Machine Learning"
    ],
    interests: "Natural Language Processing, Image Processing, Soft Computing, AI & Machine Learning and Programming",
    totalRatings: 201, feedback: []
  },
  {
    id: 14, name: "Dr. Pradipkanti Devi Lairenjam", dept: "HBS",
    subject: "Condensed Matter Physics",
    image: "https://www.iiitmanipur.ac.in/img/staff/pradipkanti.jpg",
    rating: 4.5, lastSemRating: 4.5, topPerformer: false,
    email: "pradipkanti@iiitmanipur.ac.in", phone: "+91 98765 10014",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post-Doc @ University of Freiburg, Germany",
      "Post-Doc @ JNCASR, Bengaluru, India",
      "PhD from IIT Madras, Chennai, India",
      "Assistant Professor, HBS Physics"
    ],
    interests: "Soft Condensed Matter Physics",
    totalRatings: 96, feedback: []
  },
  {
    id: 15, name: "Dr. Partha Kumar Deb", dept: "ECE",
    subject: "RF & Microwave Circuits",
    image: "https://www.iiitmanipur.ac.in/img/staff/partha.jpg",
    rating: 4.4, lastSemRating: 4.4, topPerformer: false,
    email: "parthadeb.ece@iiitmanipur.ac.in", phone: "+91 98765 10015",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NIT Agartala, Tripura, India",
      "Assistant Professor, ECE Department",
      "Expert in Microstrip Patch Antenna",
      "Research in EBG, PBG & FSS structures, Meta-materials"
    ],
    interests: "RF & Microwave circuits; Microstrip Patch Antenna; EBG, PBG & FSS structures, Meta-materials",
    totalRatings: 98, feedback: []
  },
  {
    id: 16, name: "Dr. Prabhat Singh", dept: "ECE",
    subject: "Semiconductor Device Physics",
    image: "https://www.iiitmanipur.ac.in/img/staff/prabhat.jpg",
    rating: 4.5, lastSemRating: 4.5, topPerformer: false,
    email: "prabhat@iiitmanipur.ac.in", phone: "+91 98765 10016",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post doc @ IIT Bhubaneswar, Odisha",
      "PhD from NIT Hamirpur, India",
      "Assistant Professor, ECE Department",
      "Expert in solid-state devices & analog CMOS"
    ],
    interests: "Semiconductor device physics, solid-state devices, analog complementary metal oxide semiconductor",
    totalRatings: 112, feedback: []
  },
  {
    id: 17, name: "Dr. Rajkumari Bidyalakshmi Devi", dept: "CSE",
    subject: "Image & Video Processing",
    image: "https://www.iiitmanipur.ac.in/img/staff/bidya.jpeg",
    rating: 4.7, lastSemRating: 4.7, topPerformer: false,
    email: "rajkumari@iiitmanipur.ac.in", phone: "+91 98765 10017",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NIT Manipur, Imphal, India",
      "Assistant Professor, CSE Department",
      "Expert in Image and Video processing",
      "Research in Deep learning"
    ],
    interests: "Image and Video processing, Deep learning",
    totalRatings: 144, feedback: []
  },
  {
    id: 18, name: "Dr. Ramesh Ch. Mishra", dept: "ECE",
    subject: "Wireless & MIMO Communications",
    image: "https://www.iiitmanipur.ac.in/img/staff/Ramesh.png",
    rating: 4.6, lastSemRating: 4.6, topPerformer: false,
    email: "ramesh@iiitmanipur.ac.in", phone: "+91 98765 10018",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from IIT Guwahati, India",
      "Assistant Professor, ECE Department",
      "Expert in MIMO Systems",
      "Research in Signal Processing for Communications"
    ],
    interests: "Wireless Communications, MIMO Systems, Signal Processing for Communications",
    totalRatings: 131, feedback: []
  }
];

/** Returns initials from a professor name */
function getInitials(name) {
  return name.split(" ").filter(w => w.length > 1).map(w => w[0]).slice(0, 2).join("");
}

/** Returns sorted professors by lastSemRating desc */
function getSortedProfessors(profsArr) {
  return [...profsArr].sort((a, b) => b.lastSemRating - a.lastSemRating);
}

/** Build an avatar img element with fallback to initials */
function buildAvatarImg(prof, size, borderColor) {
  const dc = DEPT_COLORS[prof.dept] || "#c084fc";
  const wrapper = document.createElement("div");
  wrapper.style.cssText = `
    width:${size}px; height:${size}px; border-radius:50%;
    border:3px solid ${borderColor}; overflow:hidden;
    flex-shrink:0; background:#111;
    box-shadow:0 0 18px ${borderColor}55;
  `;
  const img = document.createElement("img");
  img.src = prof.image;
  img.alt = prof.name;
  img.style.cssText = "width:100%;height:100%;object-fit:cover;object-position:top";
  img.onerror = function() {
    wrapper.style.background = dc + "22";
    wrapper.style.display = "flex";
    wrapper.style.alignItems = "center";
    wrapper.style.justifyContent = "center";
    wrapper.innerHTML = `<span style="color:${dc};font-size:${size*0.35}px;font-weight:900;font-family:Syne,sans-serif">${getInitials(prof.name)}</span>`;
  };
  wrapper.appendChild(img);
  return wrapper;
}
// Extra professors added
PROFESSORS_DATA.push(
  {
    id: 19, name: "Dr. Sanasam Chanu Inunganbi", dept: "CSE",
    subject: "Computer Vision & AI/ML",
    image: "https://www.iiitmanipur.ac.in/img/staff/Inung.jpg",
    rating: 5, lastSemRating: 4.4, topPerformer: false,
    email: "inunganbi@iiitmanipur.ac.in", phone: "+91 98765 10019",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NIT Manipur, India",
      "Assistant Professor, CSE Department",
      "Expert in Computer Vision and Pattern Recognition",
      "Research in AI/ML"
    ],
    interests: "Computer Vision, Pattern recognition and AI/ML",
    totalRatings: 76, feedback: []
  },
  {
    id: 20, name: "Dr. Sunita Warjri", dept: "CSE",
    subject: "NLP & Machine Learning",
    image: "https://www.iiitmanipur.ac.in/img/staff/Sunita.png",
    rating: 4.3, lastSemRating: 4.3, topPerformer: false,
    email: "sunitaw@iiitmanipur.ac.in", phone: "+91 98765 10020",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post-doc @ University of South Bohemia, Czech Republic",
      "PhD from North-Eastern Hill University (NEHU), Shillong, India",
      "Assistant Professor, CSE Department"
    ],
    interests: "Natural Language Processing (NLP), Image Processing, Computer Vision, AI & Machine Learning, Data or Corpus building, collection, and analyst",
    totalRatings: 68, feedback: []
  },
  {
    id: 21, name: "Dr. Sumit Kumar Rano", dept: "HBS",
    subject: "Abstract Harmonic Analysis",
    image: "https://www.iiitmanipur.ac.in/img/staff/Sumit%20Kumar%20Rano.png",
    rating: 4.2, lastSemRating: 4.2, topPerformer: false,
    email: "sumitrano@iiitmanipur.ac.in", phone: "+91 98765 10021",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from IIT Guwahati, India",
      "Assistant Professor, HBS Mathematics"
    ],
    interests: "Abstract Harmonic Analysis",
    totalRatings: 52, feedback: []
  },
  {
    id: 22, name: "Dr. Somaraju Boda", dept: "ECE",
    subject: "Signal Processing & ML",
    image: "https://www.iiitmanipur.ac.in/img/staff/Raju.jpg",
    rating: 4.3, lastSemRating: 4.3, topPerformer: false,
    email: "somaraju@iiitmanipur.ac.in", phone: "+91 98765 10022",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from IIT Kharagpur, India",
      "Assistant Professor, ECE Department"
    ],
    interests: "Signal processing, Biomedical signal processing, Machine learning, and Deep learning",
    totalRatings: 61, feedback: []
  },
  {
    id: 23, name: "Dr. Teressa Loingjam", dept: "CSE",
    subject: "Biometrics Security",
    image: "https://www.iiitmanipur.ac.in/img/staff/TeressaPP.jpg",
    rating: 4.4, lastSemRating: 4.4, topPerformer: false,
    email: "teressa@iiitmanipur.ac.in", phone: "+91 98765 10023",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NIT Durgapur, India",
      "Assistant Professor, CSE Department"
    ],
    interests: "Biometrics Security",
    totalRatings: 58, feedback: []
  },
  {
    id: 24, name: "Dr. Rahul Lahkar", dept: "CSE",
    subject: "Biometrics & Deep Learning",
    image: "https://www.iiitmanipur.ac.in/img/staff/Rahul.png",
    rating: 4.3, lastSemRating: 4.3, topPerformer: false,
    email: "rahullahkar@iiitmanipur.ac.in", phone: "+91 98765 10024",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from Department of IT, Gauhati University, Assam, India",
      "Assistant Professor, CSE Department"
    ],
    interests: "Biometrics, Machine Learning, Deep Learning and Cryptography",
    totalRatings: 55, feedback: []
  },
  {
    id: 25, name: "Dr. Salam Michael Singh", dept: "CSE",
    subject: "Deep Learning & NLP",
    image: "https://www.iiitmanipur.ac.in/img/staff/Michael.png",
    rating: 4.5, lastSemRating: 4.5, topPerformer: false,
    email: "michael_s@iiitmanipur.ac.in", phone: "+91 98765 10025",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "Post-Doc from IIT Delhi",
      "PhD from NIT Silchar",
      "Assistant Professor, CSE Department"
    ],
    interests: "Deep Learning, Natural Language Processing, Machine Translation, Multilingual NLP, Generative AI, AI for Mental Health and Healthcare",
    totalRatings: 72, feedback: []
  },
  {
    id: 26, name: "Dr. Sanjib Choudhury", dept: "HBS",
    subject: "Mathematics",
    image: "https://www.iiitmanipur.ac.in/img/staff/sanjibch.jpg",
    rating: 4.2, lastSemRating: 4.2, topPerformer: false,
    email: "sanjib@iiitmanipur.ac.in", phone: "+91 98765 10026",
    linkedin: "https://linkedin.com", instagram: "https://instagram.com", facebook: "https://facebook.com",
    achievements: [
      "PhD from NERIST, India",
      "Assistant Professor, HBS Mathematics"
    ],
    interests: "Sampling Techniques, Mathematical and Statistical Modelling",
    totalRatings: 48, feedback: []
  }
);