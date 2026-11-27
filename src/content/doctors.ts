import { doctors } from "./site";

/** Title of the personal chapter: shown in "Outside the office", not in the story chapters. */
export const OFF_DUTY = "Off duty";

/* --------------------------------------------------------------------------
   Doctor profile pages, from the approved Team drafts v3 (13 Nov 2026).
   Story text keeps the draft wording; a blank line starts a new paragraph and
   lines starting with "- " become a bullet list. Do not add claims the drafts
   don't make.
-------------------------------------------------------------------------- */

export type DoctorProfile = {
  slug: string;
  /** title tag and meta description, word for word from the draft */
  seo: { title: string; description: string };
  /** hero paragraph */
  lead: string;
  /** the bio from the practice's current website (client feedback, Nov 2026), one paragraph per entry.
      [text](/href) makes an inline link. */
  bio: string[];
  /** primary hero button */
  bookLabel: string;
  /** a sentence from the draft, shown as the scroll statement */
  statement: string;
  /** AT A GLANCE facts for the hero */
  facts: { label: string; value: string }[];
  /** the draft sections, as titled chapters */
  story: { title: string; text: string }[];
  /** education, honours and training, in order */
  journey: { title: string; place: string }[];
  /** clinical focus; hrefs are the sitemap URLs of the treatment pages */
  focus: { label: string; href?: string }[];
  /** extra groups shown beside the focus list */
  extras: { title: string; items: string[] }[];
  /** life outside the office */
  personal: string[];
  faqs: { q: string; a: string }[];
  cta: { title: string; text: string };
};

const profiles: DoctorProfile[] = [
  {
    slug: "meet-dr-zan-chaudhary-dmd",
    seo: {
      title: "Dr. Zan Chaudhary, DMD | Dentist in Media, PA",
      description:
        "Meet Dr. Zan Chaudhary DMD at Media Brite Smile in Media, PA. Nova Southeastern trained, Invisalign certified, ADA member. Call (610) 566-2711.",
    },
    lead: "Dr. Zan is a general and cosmetic dentist at Media Brite Smile. He is Invisalign certified and an active member of the American Dental Association.",
    bio: [
      "Dr. Zan was born and raised in West Chester, PA and has been committed to providing comprehensive care to patients of all ages. Dr. Zan completed his Bachelor of Science at West Chester University, and received his Doctorate of Dental Medicine from Nova Southeastern University College of Dental Medicine in Fort Lauderdale, Florida.",
      "While attending Nova Southeastern University, Dr. Zan worked with rural and underserved populations as part of the Remote Area Medical missions group and the Ryan White Foundation. Alongside his own dental training, Dr. Zan mentored master’s students seeking to pursue dentistry, and also enjoyed teaching human anatomy on cadavers to medical, nursing and fellow dental students, and other postgraduate professionals.",
      "Since returning home to Pennsylvania, Dr. Zan has completed numerous continuing education courses, is [Invisalign®](/cosmetic-dentistry/invisalign) certified, and is an active member of the American Dental Association (ADA). Dr. Zan enjoys smile design and providing cosmetic transformations as much as routine, comprehensive, and preventative care.",
      "In his free time, Dr. Zan spends a lot of time with his parents, reading fiction novels, and traveling. Half of his family lives in Dallas, TX, and he also enjoys visiting South Florida.",
    ],
    bookLabel: "Book With Dr. Zan",
    statement:
      "Teaching anatomy is relevant to the chair, not just the CV. It is the same knowledge that tells a dentist where a nerve runs before an injection goes in.",
    facts: [
      { label: "Qualification", value: "Doctorate of Dental Medicine (DMD)" },
      {
        label: "Dental school",
        value: "Nova Southeastern University College of Dental Medicine, Fort Lauderdale, Florida",
      },
      { label: "Undergraduate", value: "Bachelor of Science, West Chester University" },
      { label: "Certification", value: "Invisalign certified" },
      { label: "Membership", value: "American Dental Association (ADA)" },
      { label: "Focus", value: "Smile design, cosmetic dentistry, routine and preventative care" },
    ],
    story: [
      {
        title: "Education and Training",
        text: "Dr. Zan was born and raised in West Chester, Pennsylvania, and studied close to home before training in Florida.\n\nHe completed his Bachelor of Science at West Chester University. He then earned his Doctorate of Dental Medicine at Nova Southeastern University College of Dental Medicine, in Fort Lauderdale.\n\nSince returning to Pennsylvania he has completed numerous continuing education courses, and he is Invisalign certified.",
      },
      {
        title: "Teaching and Outreach",
        text: "At Nova Southeastern, Dr. Zan worked with rural and underserved patients. He did this through the Remote Area Medical missions group and the Ryan White Foundation.\n\nHe also mentored master’s students who were applying to dentistry. And he taught human anatomy on cadavers, to medical students, nursing students, fellow dental students and other postgraduates.\n\nTeaching anatomy is relevant to the chair, not just the CV. It is the same knowledge that tells a dentist where a nerve runs before an injection goes in.",
      },
      {
        title: "What Dr. Zan Treats",
        text: "He works across the full range of general dentistry and has a particular interest in the cosmetic side.\n\n- Cosmetic work. Smile design, porcelain veneers, dental bonding and teeth whitening, where the planning matters as much as the procedure.\n- Invisalign. He is Invisalign certified. He checks whether aligners suit your case, plans the tooth movements, and sees it through to retainers.\n- Routine and preventative care. Check-ups, cleanings, fillings and the everyday work that keeps bigger treatment unnecessary.",
      },
      {
        title: OFF_DUTY,
        text: "Dr. Zan spends a lot of his free time with his parents, reads fiction, and travels when he can. Half his family lives in Dallas, Texas, and he still enjoys getting back to South Florida.",
      },
    ],
    journey: [
      { title: "Bachelor of Science", place: "West Chester University" },
      {
        title: "Doctorate of Dental Medicine",
        place: "Nova Southeastern University College of Dental Medicine, Fort Lauderdale, FL",
      },
      { title: "Invisalign certified", place: "Plus numerous continuing education courses" },
      { title: "Active member", place: "American Dental Association (ADA)" },
    ],
    focus: [
      { label: "Invisalign clear aligners", href: "/cosmetic-dentistry/invisalign" },
      { label: "Porcelain veneers", href: "/cosmetic-dentistry/porcelain-veneers" },
      { label: "Teeth whitening", href: "/cosmetic-dentistry/teeth-whitening" },
      { label: "Dental bonding", href: "/cosmetic-dentistry/dental-bonding" },
      { label: "Cosmetic dentistry", href: "/cosmetic-dentistry" },
      { label: "Check-ups and cleanings", href: "/preventative-care/teeth-cleaning-and-check-ups" },
    ],
    extras: [
      {
        title: "Teaching and outreach",
        items: [
          "Remote Area Medical missions",
          "Ryan White Foundation",
          "Mentored master’s students applying to dentistry",
          "Taught human anatomy on cadavers",
        ],
      },
    ],
    personal: [
      "Time with his parents",
      "Reading fiction",
      "Traveling",
      "Family in Dallas, TX",
      "Visiting South Florida",
    ],
    faqs: [
      {
        q: "Is Dr. Zan Chaudhary accepting new patients?",
        a: "Yes. New patients are welcome at Media Brite Smile, and you can ask for Dr. Zan by name when you book. Call (610) 566-2711 or send an appointment request. If you have no dental insurance, the $99 New Patient Special applies against a regular price of $315.",
      },
      {
        q: "Is Dr. Zan an Invisalign provider?",
        a: "Yes, Dr. Zan is Invisalign certified. He checks whether clear aligners suit your case, plans the treatment, and sees it through to retainers. There is $1,000 off Invisalign at the moment, against a regular price of $5,800. A free consultation is included.",
      },
      {
        q: "Where did Dr. Zan train?",
        a: "He studied at West Chester University for his Bachelor of Science. His dental degree is from Nova Southeastern University College of Dental Medicine, in Fort Lauderdale. He has taken many continuing education courses since coming back to Pennsylvania.",
      },
      {
        q: "Can I request a specific dentist?",
        a: "Yes. Say so when you call, or on the appointment request form. Several dentists work here and each has a different focus. Tell us what you are coming in for and we will match you to the right one.",
      },
    ],
    cta: {
      title: "Book an Appointment With Dr. Zan",
      text: "Say his name when you book and the appointment is scheduled with him.",
    },
  },
  {
    slug: "meet-dr-sanketkumar-suvagiya-dmd",
    seo: {
      title: "Dr. Sanketkumar Suvagiya, DMD | Media, PA Dentist",
      description:
        "Meet Dr. Sanketkumar Suvagiya DMD at Media Brite Smile, Media, PA. Rutgers orofacial pain fellowship, restorative dentistry. Call (610) 566-2711.",
    },
    lead: "Dr. Suvagiya is a restorative dentist at Media Brite Smile. He holds a fellowship in orofacial pain from Rutgers University and treats TMD, jaw muscle pain and headaches alongside general restorative work.",
    bio: [
      "Dr. Sanketkumar Suvagiya was born and raised in India, where he began his journey in dentistry at AMC Dental College. Driven by a passion for advancing his skills and providing high-quality care, he moved to the United States to pursue further education. He earned his Doctor of Dental Medicine (DMD) degree from Nova Southeastern University, graduating with the highest honors and receiving recognition from Omicron Kappa Upsilon (OKU), the national dental honor society. He also has a fellowship in orofacial pain from Rutgers University, where he learned how to manage patients with [TMD](/tmj-tmd-treatment-media-pa), muscle pain and headaches.",
      "Dr. Suvagiya is committed to delivering compassionate, patient-centered care. He has been actively involved in community dental outreach and takes pride in helping patients achieve healthier, more confident smiles while alleviating pain and discomfort. His clinical interests include restorative dentistry, crowns and bridges, veneers, root canal therapy, and extractions.",
      "Outside the office, Dr. Suvagiya enjoys staying active by working out, playing pickleball, and exploring a variety of cuisines.",
    ],
    bookLabel: "Book With Dr. Suvagiya",
    statement:
      "Orofacial pain is a distinct area of advanced dental training, and most general dentists have not done it.",
    facts: [
      { label: "Qualification", value: "Doctor of Dental Medicine (DMD)" },
      { label: "Dental school", value: "Nova Southeastern University, graduated with the highest honors" },
      { label: "Earlier training", value: "AMC Dental College, India" },
      { label: "Fellowship", value: "Orofacial Pain, Rutgers University" },
      { label: "Honor", value: "Omicron Kappa Upsilon (OKU), the national dental honor society" },
      {
        label: "Focus",
        value: "Restorative dentistry, crowns and bridges, veneers, root canals, extractions, TMD",
      },
    ],
    story: [
      {
        title: "Education and Training",
        text: "Dr. Suvagiya was born and raised in India, where he began his dental training at AMC Dental College. He moved to the United States to continue his education.\n\nHe earned his Doctor of Dental Medicine at Nova Southeastern University, graduating with the highest honors. He was also recognized by Omicron Kappa Upsilon, the national dental honor society.\n\nHe then completed a fellowship in orofacial pain at Rutgers University, training in the management of temporomandibular disorder, jaw muscle pain and headaches.",
      },
      {
        title: "Why the Orofacial Pain Fellowship Matters",
        text: "Orofacial pain is a distinct area of advanced dental training, and most general dentists have not done it.\n\nJaw pain, clicking, locking and headaches of dental origin get missed a lot. Patients often spend months being treated for something else.\n\nThe fellowship training is about working out which structure is causing the pain, and whether a dentist is the right person to treat it. Dr. Suvagiya holds a fellowship, not specialist registration. Cases that fall outside dentistry are referred to the right clinician.",
      },
      {
        title: "What Dr. Suvagiya Treats",
        text: "His clinical interests sit on the restorative side of general practice.\n\n- Restorative dentistry. Rebuilding teeth that are broken, worn or heavily filled.\n- Crowns and bridges. Full-coverage restorations and replacing missing teeth where an implant is not the chosen route.\n- Porcelain veneers. Front-tooth work where shade, shape and bite all have to agree.\n- Root canal therapy and extractions. Saving teeth where that is realistic, and removing them cleanly where it is not.\n- TMD and orofacial pain. Jaw pain, clicking, muscle pain and related headaches.",
      },
      {
        title: "Community Work",
        text: "Dr. Suvagiya has been active in community dental outreach. He takes particular satisfaction in treating patients who arrive in pain.",
      },
      {
        title: OFF_DUTY,
        text: "Away from the practice he stays active by working out and playing pickleball, and enjoys exploring different cuisines.",
      },
    ],
    journey: [
      { title: "Began in dentistry", place: "AMC Dental College, India" },
      {
        title: "Doctor of Dental Medicine (DMD)",
        place: "Nova Southeastern University, graduated with the highest honors",
      },
      { title: "Omicron Kappa Upsilon (OKU)", place: "The national dental honor society" },
      { title: "Fellowship in Orofacial Pain", place: "Rutgers University: TMD, jaw muscle pain and headaches" },
    ],
    focus: [
      { label: "Restorative dentistry", href: "/restorative-dentistry" },
      { label: "Dental crowns", href: "/restorative-dentistry/dental-crowns" },
      { label: "Dental bridges", href: "/restorative-dentistry/dental-bridges" },
      { label: "Porcelain veneers", href: "/cosmetic-dentistry/porcelain-veneers" },
      { label: "Root canal treatment", href: "/restorative-dentistry/root-canal" },
      { label: "Tooth extractions", href: "/restorative-dentistry/tooth-extractions" },
      { label: "TMJ and jaw pain", href: "/tmj-tmd-treatment-media-pa" },
    ],
    extras: [
      { title: "Orofacial pain care", items: ["TMD", "Jaw muscle pain", "Headaches"] },
      { title: "Giving back", items: ["Community dental outreach"] },
    ],
    personal: ["Working out", "Playing pickleball", "Exploring different cuisines"],
    faqs: [
      {
        q: "What is an orofacial pain fellowship?",
        a: "It is advanced dental training in jaw, face and mouth pain. That covers TMD, chewing muscle pain, and headaches that start in the teeth or jaw. Dr. Suvagiya completed his fellowship at Rutgers University. It is a fellowship, not specialist registration.",
      },
      {
        q: "Can Dr. Suvagiya help with my jaw pain or headaches?",
        a: "Often, yes. Jaw joint problems, clenching and an uneven bite can all cause pain that shows up as headaches or earache. The assessment works out which structures are involved. Where the cause is neurological or ENT, you are referred to the appropriate specialist.",
      },
      {
        q: "Where did Dr. Suvagiya train?",
        a: "He began at AMC Dental College in India. He then earned his dental degree at Nova Southeastern University, graduating with the highest honors and recognition from Omicron Kappa Upsilon. He later completed a fellowship in orofacial pain at Rutgers University.",
      },
      {
        q: "Does he do root canals?",
        a: "Yes. Root canals are one of his clinical interests, along with crowns, bridges, veneers and extractions. Complex cases that need an endodontist are referred to one. You would be told that at the assessment, not partway through.",
      },
    ],
    cta: {
      title: "Book an Appointment With Dr. Suvagiya",
      text: "Particularly worth asking for if you have jaw pain, headaches or restorative work to discuss.",
    },
  },
  {
    slug: "meet-dr-bhadresh-makani-dds",
    seo: {
      title: "Dr. Bhadresh Makani, DDS | Implant Dentist, Media, PA",
      description:
        "Meet Dr. Bhadresh Makani DDS at Media Brite Smile, Media, PA. NYU trained, thousands of implants placed, All-on-X and CBCT-guided surgery.",
    },
    lead: "Dr. Makani is an implant-focused dentist at Media Brite Smile. He trained at New York University College of Dentistry and has placed thousands of implants, from single teeth to full-arch reconstruction.",
    bio: [
      "Dr. Bhadresh Makani is an implant-focused dentist dedicated to helping patients restore their smiles, confidence, and quality of life through advanced dental implant treatment and full-mouth rehabilitation. After completing his advanced dental training and earning his Doctor of Dental Surgery (DDS) degree from New York University College of Dentistry, Dr. Makani has continued to pursue extensive education and advanced training in implant dentistry, full-mouth reconstruction, and digital dentistry.",
      "With years of experience and thousands of implants placed, Dr. Makani performs a [wide range of implant procedures](/restorative-dentistry/dental-implants) including single dental implants, implant-supported bridges, overdentures, full-mouth implant reconstruction, and advanced All-on-X “Teeth-in-a-Day” solutions. He has completed advanced continuing education programs both nationally and internationally, including implant and full-arch rehabilitation training in Portugal, Brazil, and other leading centers for implant education.",
      "Dr. Makani stays at the forefront of modern implant dentistry by utilizing [advanced technology](/patient-information/care-and-comfort/advanced-technology) including CBCT 3D imaging, digital implant planning, guided surgery, intraoral scanning, and photogrammetry for full-arch implant cases. His experience with multiple implant systems and techniques allows him to provide personalized treatment solutions tailored to each patient’s needs, anatomy, and long-term goals.",
      "Patient comfort is an important part of Dr. Makani’s approach to care. He offers nitrous oxide and oral sedation options to help patients feel relaxed and comfortable throughout treatment while focusing on delivering functional, natural-looking, and long-lasting results.",
      "Known for his compassionate approach and attention to detail, Dr. Makani believes in educating patients thoroughly and developing individualized treatment plans that help patients regain the ability to smile, chew, and live confidently again.",
      "Outside of dentistry, Dr. Makani enjoys spending time with family, traveling, continuing advanced education, and staying current with the latest advancements in implant and [restorative dentistry](/restorative-dentistry).",
    ],
    bookLabel: "Book a Free Implant Consultation",
    statement:
      "Implant outcomes depend on planning, and Dr. Makani plans digitally before anyone picks up an instrument.",
    facts: [
      { label: "Qualification", value: "Doctor of Dental Surgery (DDS)" },
      { label: "Dental school", value: "New York University College of Dentistry" },
      { label: "Experience", value: "Thousands of implants placed" },
      { label: "Advanced training", value: "Implant and full-arch rehabilitation, including Portugal and Brazil" },
      {
        label: "Technology",
        value: "CBCT 3D imaging, digital implant planning, guided surgery, intraoral scanning, photogrammetry",
      },
      { label: "Comfort", value: "Nitrous oxide and oral sedation" },
    ],
    story: [
      {
        title: "Education and Training",
        text: "Dr. Makani earned his Doctor of Dental Surgery at New York University College of Dentistry. He had completed advanced dental training before that.\n\nSince then he has done extensive continuing education in implant dentistry, full-mouth reconstruction and digital dentistry. That has included full-arch rehabilitation programs in the US and abroad, among them training at implant centers in Portugal and Brazil.",
      },
      {
        title: "What Dr. Makani Does",
        text: "Implant dentistry is the center of his work, across the full range of cases.\n\n- Single dental implants to replace one missing tooth\n- Implant-supported bridges where several teeth are missing together\n- Implant overdentures for a denture that stays put\n- Full-mouth implant reconstruction\n- All-on-X “Teeth-in-a-Day” full-arch solutions\n\nHe works with several implant systems and techniques, so the plan follows your anatomy, not whichever system the practice happens to stock.",
      },
      {
        title: "How He Plans a Case",
        text: "Implant outcomes depend on planning, and Dr. Makani plans digitally before anyone picks up an instrument.\n\nCBCT 3D imaging maps the bone in three dimensions, showing where there is enough and where the nerve and sinus sit. Digital implant planning sets the position and angle of every post on screen. Guided surgery then uses a custom guide to place each implant where it was planned.\n\nFor full-arch cases he adds photogrammetry. That records exactly where the implants sit in relation to each other, so the final bridge seats without being forced. Dental impressions are captured on an intraoral scanner, so there is no putty tray involved.",
      },
      {
        title: "Comfort During Treatment",
        text: "Patient comfort is part of how Dr. Makani approaches surgical work. It is not bolted on at the end.\n\nHe offers nitrous oxide and oral sedation to help patients stay relaxed through treatment. Deeper hospital-level sedation is not provided at this practice, and you will be told that plainly rather than discovering it on the day.\n\nHe is known for explaining things thoroughly. Treatment plans are built around each patient's anatomy and long-term goals, so you can smile, chew and speak normally again.",
      },
      {
        title: OFF_DUTY,
        text: "Dr. Makani spends his time with family, travels, and keeps up with advances in implant and restorative dentistry through continuing education.",
      },
    ],
    journey: [
      { title: "Doctor of Dental Surgery (DDS)", place: "New York University College of Dentistry" },
      { title: "Continuing education", place: "Implant dentistry, full-mouth reconstruction and digital dentistry" },
      { title: "Full-arch rehabilitation training", place: "In the US and abroad, including Portugal and Brazil" },
      { title: "Thousands of implants placed", place: "Across several implant systems and techniques" },
    ],
    focus: [
      { label: "Single dental implants", href: "/restorative-dentistry/dental-implants" },
      { label: "Implant-supported bridges", href: "/restorative-dentistry/dental-bridges" },
      { label: "Implant overdentures", href: "/restorative-dentistry/dentures/implant-retained-dentures" },
      { label: "Full-mouth implant reconstruction", href: "/restorative-dentistry/full-arch-dental-implants" },
      { label: "All-on-X “Teeth-in-a-Day”", href: "/restorative-dentistry/full-arch-dental-implants" },
    ],
    extras: [
      {
        title: "Technology he uses",
        items: [
          "CBCT 3D imaging",
          "Digital implant planning",
          "Guided surgery",
          "Intraoral scanning",
          "Photogrammetry",
        ],
      },
      { title: "Comfort options", items: ["Nitrous oxide", "Oral sedation"] },
    ],
    personal: [
      "Time with family",
      "Traveling",
      "Continuing education",
      "Advances in implant and restorative dentistry",
    ],
    faqs: [
      {
        q: "How many implants has Dr. Makani placed?",
        a: "Thousands. That spans single implants, implant-supported bridges, overdentures and full-arch reconstruction. Volume matters here. The gap between a good and a poor outcome usually comes down to planning and placement accuracy, not the implant itself.",
      },
      {
        q: "Where did Dr. Makani train?",
        a: "He earned his Doctor of Dental Surgery at New York University College of Dentistry. Since then he has completed advanced training in implant dentistry and full-arch rehabilitation, in the US and abroad. That includes implant centers in Portugal and Brazil.",
      },
      {
        q: "Does he offer sedation?",
        a: "Yes. Nitrous oxide and oral sedation are both available. Deeper hospital-level sedation is not offered here. Mention anxiety when you book, and the appointment is planned around it.",
      },
      {
        q: "What is All-on-X?",
        a: "All-on-X is full-arch implant treatment. A fixed bridge replaces every tooth in a jaw, held by implants whose number is decided by your CBCT scan, rather than a fixed count chosen before anyone has looked.",
      },
      {
        q: "Is the implant consultation free?",
        a: "Yes. You get the assessment and a written plan with costs. There is $500 off implant, abutment and crown at the moment, against a regular price starting at $3,999. You decide afterward. Nothing is booked unless you ask.",
      },
    ],
    cta: {
      title: "Book a Free Implant Consultation",
      text: "A free consultation, a straight answer on candidacy, and the cost explained before anything is booked.",
    },
  },
];

export type Doctor = (typeof doctors)[number];

export const doctorSlug = (d: Doctor) => d.href.split("/").pop()!;

export function getDoctor(slug: string) {
  const doctor = doctors.find((d) => doctorSlug(d) === slug);
  const profile = profiles.find((p) => p.slug === slug);
  return doctor && profile ? { doctor, profile } : undefined;
}

export const doctorSlugs = profiles.map((p) => p.slug);
