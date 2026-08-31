import {
  Bell,
  BookOpen,
  Calendar,
  ClipboardCheck,
  ClipboardList,
  CreditCard,
  Flag,
  FileText,
  Globe,
  GraduationCap,
  Layers,
  LayoutGrid,
  LogIn,
  Medal,
  Megaphone,
  MessageSquare,
  Receipt,
  RefreshCw,
  ScrollText,
  Shield,
  ShieldCheck,
  TrendingUp,
  Trophy,
  Upload,
  UserCog,
  Users,
  type LucideIcon,
} from "lucide-react";

/**
 * Help Center content is static copy, not a database entity — modelled here
 * as a typed module rather than a service/repository. English/Filipino
 * pairing is a first-class pattern across the whole page: every heading,
 * description, and step ships both languages.
 *
 * Source verbatim from docs/screens/mobile-02.md, mobile-03.md, mobile-04.md.
 * Where the screenshot corpus captured English copy but only noted that a
 * Filipino line existed without transcribing it (most Admin steps beyond
 * Section 1, most Trainer steps, and a few Trainee steps), the `fil` value
 * below is a builder-authored translation rather than a verbatim capture —
 * flagged in the wave-1 return receipt.
 */

export type Bilingual = { en: string; fil: string };

export type HelpStep = Bilingual;

export type HelpSection = {
  id: string;
  icon: LucideIcon;
  title: Bilingual;
  steps: HelpStep[];
};

export type HelpRoleId = "admin" | "trainer" | "trainee";
export type HelpAccent = "blue" | "orange" | "green";

export type HelpRole = {
  id: HelpRoleId;
  icon: LucideIcon;
  label: Bilingual;
  accent: HelpAccent;
  description: Bilingual;
  sections: HelpSection[];
};

export const HELP_ROLES: HelpRole[] = [
  {
    id: "admin",
    icon: Shield,
    label: { en: "Admin", fil: "Tagapamahala" },
    accent: "blue",
    description: {
      en: "You manage the entire platform — enrollments, payments, users, certificates, announcements, analytics, and the audit log.",
      fil: "Ikaw ang namamahala sa buong platform — mga enrollment, bayad, users, certificates, anunsyo, analytics, at audit log.",
    },
    sections: [
      {
        id: "admin-login",
        icon: LogIn,
        title: { en: "How to Log In", fil: "Paano Mag-Login" },
        steps: [
          {
            en: 'Go to the website and click the "Login" button at the top-right corner of the navigation bar.',
            fil: 'Pumunta sa website at i-click ang "Login" na button sa kanang sulok sa itaas ng navigation bar.',
          },
          {
            en: 'Enter your Admin email address and password, then click "Sign In".',
            fil: 'Ilagay ang iyong Admin email address at password, pagkatapos i-click ang "Sign In".',
          },
          {
            en: 'After logging in, click on your name (top-right) then click "Admin Dashboard" to go to your control panel.',
            fil: 'Pagkatapos mag-login, i-click ang iyong pangalan (kanang sulok sa itaas) tapos i-click ang "Admin Dashboard" para pumunta sa iyong control panel.',
          },
        ],
      },
      {
        id: "admin-dashboard",
        icon: LayoutGrid,
        title: {
          en: "Understanding Your Dashboard",
          fil: "Pag-unawa sa Iyong Dashboard",
        },
        steps: [
          {
            en: "The Overview section shows live statistics: total users, pending enrollments, month-to-date revenue, and certificate requests.",
            fil: "Ipinapakita ng seksyong Overview ang live na estadistika: kabuuang users, mga naghihintay na enrollment, revenue sa buwang ito, at mga certificate request.",
          },
          {
            en: "Use the sidebar (left panel) to navigate between 8 sections: Overview, Enrollments, User Management, Certificates, Announcements, Analytics, Payment Methods, and Audit Log.",
            fil: "Gamitin ang sidebar (kaliwang panel) para lumipat sa 8 seksyon: Overview, Enrollments, User Management, Certificates, Announcements, Analytics, Payment Methods, at Audit Log.",
          },
          {
            en: "The revenue area chart shows 6-month trends. The pie chart shows how trainees are distributed across programs (Computer Hardware, Cellphone Repair).",
            fil: "Ipinapakita ng revenue area chart ang 6 buwang trend. Ipinapakita naman ng pie chart kung paano naka-distribute ang mga trainee sa iba't ibang programa (Computer Hardware, Cellphone Repair).",
          },
          {
            en: "Use the Quick Action cards on the Overview to jump directly to: Manage Users, Approve Enrollments, Approve Certificates, and Audit Log.",
            fil: "Gamitin ang mga Quick Action card sa Overview para direktang pumunta sa: Manage Users, Approve Enrollments, Approve Certificates, at Audit Log.",
          },
        ],
      },
      {
        id: "admin-enrollments",
        icon: Receipt,
        title: {
          en: "Approving Enrollments & Payments",
          fil: "Pag-approve ng mga Enrollment at Bayad",
        },
        steps: [
          {
            en: 'Go to "Enrollments" in the sidebar. You will see all pending enrollment applications submitted by trainees.',
            fil: 'Pumunta sa "Enrollments" sa sidebar. Makikita mo doon ang lahat ng nakabinbing enrollment application na isinumite ng mga trainee.',
          },
          {
            en: "Each enrollment shows the trainee name, program, payment method (GCash, Maya, Bank Transfer, Card), amount, and payment proof image.",
            fil: "Ipinapakita sa bawat enrollment ang pangalan ng trainee, programa, paraan ng pagbabayad (GCash, Maya, Bank Transfer, Card), halaga, at larawan ng patunay ng bayad.",
          },
          {
            en: "Click the receipt thumbnail to open a full-screen preview of the payment proof image before approving.",
            fil: "I-click ang thumbnail ng resibo para buksan ang full-screen preview ng larawan ng patunay ng bayad bago mag-approve.",
          },
          {
            en: 'Click "Verify & Approve" to confirm the payment and activate the trainee\'s account. The trainee will receive a notification.',
            fil: 'I-click ang "Verify & Approve" para kumpirmahin ang bayad at i-activate ang account ng trainee. Makakatanggap ng notification ang trainee.',
          },
          {
            en: 'Click "Reject" if the payment proof is invalid or missing. You can provide a reason for rejection.',
            fil: 'I-click ang "Reject" kung hindi wasto o kulang ang patunay ng bayad. Maaari kang magbigay ng dahilan para sa pagtanggi.',
          },
          {
            en: "The stats bar at the top shows Total Verified Revenue, Pending Review, Missing Proof, and Approved counts at a glance.",
            fil: "Ipinapakita ng stats bar sa itaas ang Total Verified Revenue, Pending Review, Missing Proof, at Approved counts sa isang tingin.",
          },
        ],
      },
      {
        id: "admin-users",
        icon: Users,
        title: {
          en: "Managing Users (Trainees & Trainers)",
          fil: "Pamamahala ng mga Users",
        },
        steps: [
          {
            en: 'Go to "User Management" in the sidebar. You will see a list of all users — trainees and trainers.',
            fil: 'Pumunta sa "User Management" sa sidebar. Makikita mo ang listahan ng lahat ng users — mga trainee at trainer.',
          },
          {
            en: "Use the search bar at the top to find a specific user by name or email.",
            fil: "Gamitin ang search bar sa itaas para hanapin ang isang partikular na user gamit ang pangalan o email.",
          },
          {
            en: 'To activate a pending user: Find the user with "Pending" status and update their status to "Active" using the dropdown.',
            fil: 'Para i-activate ang isang pending user: Hanapin ang user na may "Pending" status at baguhin ang status nito sa "Active" gamit ang dropdown.',
          },
          {
            en: 'To suspend a user: Change their status to "Suspended" using the Status dropdown. They will no longer be able to access the platform.',
            fil: 'Para i-suspend ang isang user: Baguhin ang status nito sa "Suspended" gamit ang Status dropdown. Hindi na nila magagamit ang platform.',
          },
          {
            en: "You can change a user's role (Admin / Trainer / Trainee) or reassign their program using the dropdowns in their row.",
            fil: "Maaari mong baguhin ang role ng user (Admin / Trainer / Trainee) o i-reassign ang kanilang programa gamit ang mga dropdown sa kanilang row.",
          },
          {
            en: "Filter users by Role (All, Admin, Trainee, Trainer) or search by name/email to quickly find who you need.",
            fil: "I-filter ang mga user ayon sa Role (All, Admin, Trainee, Trainer) o maghanap gamit ang pangalan/email para mabilis mahanap ang kailangan mo.",
          },
        ],
      },
      {
        id: "admin-certificates",
        icon: ScrollText,
        title: {
          en: "Approving Certificate Requests",
          fil: "Pag-approve ng mga Certificate Request",
        },
        steps: [
          {
            en: 'Go to "Certificates" in the sidebar. You will see a list of all trainee certificate requests.',
            fil: 'Pumunta sa "Certificates" sa sidebar. Makikita mo ang listahan ng lahat ng certificate request ng mga trainee.',
          },
          {
            en: "Each request shows the trainee name, program, trainer, and completion date.",
            fil: "Ipinapakita sa bawat request ang pangalan ng trainee, programa, trainer, at petsa ng pagkumpleto.",
          },
          {
            en: 'Click "Approve" to authorize the certificate. The trainee will be notified and can then download their official E-Certificate.',
            fil: 'I-click ang "Approve" para pahintulutan ang certificate. Bibigyan ng notification ang trainee at maaari na nilang i-download ang kanilang opisyal na E-Certificate.',
          },
          {
            en: 'Click "Reject" if the trainee does not meet the requirements yet.',
            fil: 'I-click ang "Reject" kung hindi pa natutugunan ng trainee ang mga requirement.',
          },
        ],
      },
      {
        id: "admin-announcements",
        icon: Megaphone,
        title: {
          en: "Posting Announcements",
          fil: "Pag-post ng mga Anunsyo",
        },
        steps: [
          {
            en: 'Go to "Announcements" in the sidebar. Here you can post important messages visible to all users on the landing page.',
            fil: 'Pumunta sa "Announcements" sa sidebar. Dito ka maaaring mag-post ng mahahalagang mensahe na makikita ng lahat ng users sa landing page.',
          },
          {
            en: "Fill in the Title, Body, and select the type (Info / Warning / Success). Optionally attach an image or video (max 20 MB).",
            fil: "Punan ang Title, Body, at piliin ang uri (Info / Warning / Success). Maaari ring mag-attach ng larawan o video (max 20 MB).",
          },
          {
            en: 'Check "Pin to top" to keep the announcement at the top of the list for high-priority messages.',
            fil: 'I-check ang "Pin to top" para manatili ang anunsyo sa itaas ng listahan para sa mga mahalagang mensahe.',
          },
          {
            en: "To delete an announcement, click the trash icon (🗑️) next to it.",
            fil: "Para burahin ang isang anunsyo, i-click ang trash icon (🗑️) sa tabi nito.",
          },
        ],
      },
      {
        id: "admin-analytics",
        icon: TrendingUp,
        title: {
          en: "Viewing Analytics & Reports",
          fil: "Pagtingin ng Analytics at mga Ulat",
        },
        steps: [
          {
            en: 'Go to "Analytics" in the sidebar to see platform-wide performance metrics.',
            fil: 'Pumunta sa "Analytics" sa sidebar para makita ang performance metrics ng buong platform.',
          },
          {
            en: "The stats cards show: New Signups, Activation Rate (%), Daily Active Users, and ARPU (Average Revenue Per User).",
            fil: "Ipinapakita ng stats cards ang: New Signups, Activation Rate (%), Daily Active Users, at ARPU (Average Revenue Per User).",
          },
          {
            en: 'The "Enrollments by Month" bar chart shows how many trainees enrolled each month.',
            fil: 'Ipinapakita ng "Enrollments by Month" bar chart kung ilang trainee ang nag-enroll bawat buwan.',
          },
          {
            en: 'The "Revenue Trend" area chart tracks revenue over time so you can spot growth patterns.',
            fil: 'Sinusubaybayan ng "Revenue Trend" area chart ang revenue sa paglipas ng panahon para makita mo ang growth patterns.',
          },
        ],
      },
      {
        id: "admin-payment-methods",
        icon: CreditCard,
        title: {
          en: "Setting Up Payment Methods",
          fil: "Pag-setup ng mga Paraan ng Bayad",
        },
        steps: [
          {
            en: 'Go to "Payment Methods" in the sidebar to configure how trainees can pay their enrollment fees.',
            fil: 'Pumunta sa "Payment Methods" sa sidebar para i-configure kung paano magbabayad ang mga trainee ng kanilang enrollment fee.',
          },
          {
            en: "You can enable or disable payment options like GCash, Maya, Bank Transfer, or Card by toggling the switch on each card.",
            fil: "Maaari mong i-enable o i-disable ang mga opsyon sa pagbabayad tulad ng GCash, Maya, Bank Transfer, o Card sa pamamagitan ng pag-toggle ng switch sa bawat card.",
          },
          {
            en: 'Edit the account number, account name, and bank name for each payment method. Click "Save Changes" when done.',
            fil: 'I-edit ang account number, account name, at bank name para sa bawat paraan ng bayad. I-click ang "Save Changes" kapag tapos na.',
          },
          {
            en: 'You can also add an admin note (e.g. "Send exact amount only") that trainees will see during enrollment.',
            fil: 'Maaari ka ring magdagdag ng admin note (hal. "Send exact amount only") na makikita ng mga trainee habang nag-e-enroll.',
          },
        ],
      },
      {
        id: "admin-audit-log",
        icon: ClipboardCheck,
        title: {
          en: "Checking the Audit Log",
          fil: "Pagtingin ng Audit Log",
        },
        steps: [
          {
            en: 'Go to "Audit Log" in the sidebar. This page records every action taken on the platform — by any user.',
            fil: 'Pumunta sa "Audit Log" sa sidebar. Itinatala ng page na ito ang bawat aksyon na ginawa sa platform — ng kahit sinong user.',
          },
          {
            en: "Each log entry shows: the category (e.g. enrollment, payment, certificate), the action taken, who did it, and when.",
            fil: "Ipinapakita ng bawat log entry: ang kategorya (hal. enrollment, payment, certificate), ang aksyong ginawa, sino ang gumawa nito, at kailan.",
          },
          {
            en: "Use the category filter to narrow down logs by type: user, enrollment, payment, certificate, calendar, module, system, forum, or community.",
            fil: "Gamitin ang category filter para paliitin ang mga log ayon sa uri: user, enrollment, payment, certificate, calendar, module, system, forum, o community.",
          },
        ],
      },
      {
        id: "admin-trainer-status",
        icon: UserCog,
        title: {
          en: "Managing Trainer Status & Revocation",
          fil: "Pamamahala sa Status ng Trainer at Pag-bawi",
        },
        steps: [
          {
            en: 'Go to "Trainer Management" in the sidebar to see every trainer, their assigned program, active trainees count, and average rating.',
            fil: 'Pumunta sa "Trainer Management" sa sidebar para makita ang bawat trainer, ang kanilang naka-assign na programa, bilang ng aktibong trainee, at average rating.',
          },
          {
            en: "Use the search bar to find a trainer by name or program. You can also filter by status (Active, On Leave, Suspended).",
            fil: "Gamitin ang search bar para hanapin ang isang trainer ayon sa pangalan o programa. Maaari ring i-filter ayon sa status (Active, On Leave, Suspended).",
          },
          {
            en: 'Click "Revoke Trained" on a trainee row to remove their Trained Graduate badge and re-open their evaluations. Use this only if the certification was issued in error or the trainee\'s standing is being reviewed.',
            fil: 'I-click ang "Revoke Trained" sa row ng trainee para alisin ang kanilang Trained Graduate badge at buksan muli ang kanilang mga evaluation. Gamitin lamang ito kung mali ang pagkakalabas ng certification o kung sinusuri ang standing ng trainee.',
          },
          {
            en: "Revoked trainees are notified automatically. Their certificate becomes invalid until the trainer re-evaluates and the admin re-approves.",
            fil: "Awtomatikong bibigyan ng notification ang mga na-revoke na trainee. Mawawalan ng bisa ang kanilang certificate hanggang sa muling i-evaluate ng trainer at i-approve muli ng admin.",
          },
        ],
      },
      {
        id: "admin-leaderboard",
        icon: Trophy,
        title: {
          en: "Monitoring the Forum Leaderboard",
          fil: "Pagsubaybay sa Forum Leaderboard",
        },
        steps: [
          {
            en: 'From the Forum page, click "Leaderboard" to see the most active and reputable contributors across all communities.',
            fil: 'Mula sa Forum page, i-click ang "Leaderboard" para makita ang pinaka-aktibo at may magandang reputasyon na mga kontribyutor sa lahat ng community.',
          },
          {
            en: "The leaderboard ranks users by reputation points, post count, upvotes received, and helpful replies. Top 3 users get gold, silver, and bronze badges.",
            fil: "Inirarangko ng leaderboard ang mga user ayon sa reputation points, bilang ng post, natanggap na upvotes, at mga nakatulong na reply. Ang top 3 users ay makakatanggap ng gold, silver, at bronze badges.",
          },
          {
            en: "Use the leaderboard to identify community champions you may want to promote to moderator roles, and to spot users whose content has driven the most engagement.",
            fil: "Gamitin ang leaderboard para tukuyin ang mga community champion na maaari mong i-promote sa moderator roles, at para makita ang mga user na ang content ay nakakuha ng pinaka-maraming engagement.",
          },
        ],
      },
      {
        id: "admin-forum-posts",
        icon: MessageSquare,
        title: {
          en: "Approving Forum Posts",
          fil: "Pag-approve ng mga Forum Post",
        },
        steps: [
          {
            en: "When a trainee submits a post to the forum, you will receive a notification in your bell icon (🔔).",
            fil: "Kapag nagsumite ng post ang isang trainee sa forum, makakatanggap ka ng notification sa iyong bell icon (🔔).",
          },
          {
            en: "Go to the Forum page from the navigation bar. You will see pending posts waiting for your approval.",
            fil: "Pumunta sa Forum page mula sa navigation bar. Makikita mo ang mga pending post na naghihintay ng iyong approval.",
          },
          {
            en: 'Click "Approve" to publish the post for everyone to see, or "Reject" to decline it.',
            fil: 'I-click ang "Approve" para i-publish ang post para makita ng lahat, o "Reject" para tanggihan ito.',
          },
        ],
      },
      {
        id: "admin-community-requests",
        icon: Globe,
        title: {
          en: "Approving Community Join Requests",
          fil: "Pag-approve ng mga Community Join Requests",
        },
        steps: [
          {
            en: "When a trainer or trainee requests to join a private community, you will get a notification in your bell icon (🔔).",
            fil: "Kapag humiling ang isang trainer o trainee na sumali sa isang pribadong community, makakatanggap ka ng notification sa iyong bell icon (🔔).",
          },
          {
            en: 'Go to Forum → Communities tab, find the community, and open it. Scroll to "Pending Requests" to approve or deny members.',
            fil: 'Pumunta sa Forum → Communities tab, hanapin ang community, at buksan ito. Mag-scroll sa "Pending Requests" para i-approve o tanggihan ang mga miyembro.',
          },
        ],
      },
      {
        id: "admin-notifications",
        icon: Bell,
        title: {
          en: "Checking Notifications",
          fil: "Pagtingin ng mga Notification",
        },
        steps: [
          {
            en: "Click the bell icon (🔔) at the top of the page. A panel will drop down showing all your recent notifications.",
            fil: "I-click ang bell icon (🔔) sa itaas ng page. May lalabas na panel na nagpapakita ng lahat ng iyong mga kamakailang notification.",
          },
          {
            en: 'Click "Mark all read" to clear the red badge counter, or click a notification directly to go to the relevant page.',
            fil: 'I-click ang "Mark all read" para burahin ang pulang badge counter, o direktang i-click ang isang notification para pumunta sa kaugnay na page.',
          },
          {
            en: 'Click "Clear all" to remove all notifications from the panel. The system keeps your last 20 notifications.',
            fil: 'I-click ang "Clear all" para alisin ang lahat ng notification sa panel. Itinatago ng system ang iyong huling 20 notification.',
          },
        ],
      },
    ],
  },
  {
    id: "trainer",
    icon: Layers,
    label: { en: "Trainer", fil: "Guro / Tagasanay" },
    accent: "orange",
    description: {
      en: "You teach trainees, schedule sessions on the calendar, manage modules & assignments, and evaluate trainee performance.",
      fil: "Ikaw ang nagtuturo sa mga trainee, nagsa-schedule ng mga session sa calendar, namamahala ng mga module at assignment, at nag-e-evaluate ng performance ng trainee.",
    },
    sections: [
      {
        id: "trainer-login",
        icon: LogIn,
        title: { en: "How to Log In", fil: "Paano Mag-Login" },
        steps: [
          {
            en: 'Go to the website and click "Login" at the top-right of the navigation bar.',
            fil: 'Pumunta sa website at i-click ang "Login" sa kanang itaas ng navigation bar.',
          },
          {
            en: 'Enter your Trainer email and password, then click "Sign In".',
            fil: 'Ilagay ang iyong Trainer email at password, pagkatapos i-click ang "Sign In".',
          },
          {
            en: 'Click your name at the top-right, then click "Trainer Dashboard" to open your workspace.',
            fil: 'I-click ang iyong pangalan sa kanang itaas, pagkatapos i-click ang "Trainer Dashboard" para buksan ang iyong workspace.',
          },
        ],
      },
      {
        id: "trainer-dashboard",
        icon: LayoutGrid,
        title: {
          en: "Your Dashboard Overview",
          fil: "Ang Iyong Dashboard Overview",
        },
        steps: [
          {
            en: "The Overview tab shows your key stats: Assigned Trainees, Upcoming Sessions, Modules Uploaded, and Evaluations submitted.",
            fil: "Ipinapakita ng Overview tab ang iyong pangunahing estadistika: Assigned Trainees, Upcoming Sessions, Modules Uploaded, at Evaluations submitted.",
          },
          {
            en: 'The "Upcoming Sessions" list shows your next 4 scheduled events with their time, title, room, and session type badge.',
            fil: 'Ipinapakita ng listahan ng "Upcoming Sessions" ang iyong susunod na 4 na naka-schedule na event kasama ang oras, pamagat, silid, at session type badge.',
          },
          {
            en: "Use the left sidebar to switch between: Overview, Calendar, My Trainees, Assignments, and Modules.",
            fil: "Gamitin ang kaliwang sidebar para lumipat sa: Overview, Calendar, My Trainees, Assignments, at Modules.",
          },
        ],
      },
      {
        id: "trainer-calendar",
        icon: Calendar,
        title: {
          en: "Managing Your Calendar",
          fil: "Pamamahala ng Iyong Calendar",
        },
        steps: [
          {
            en: 'Click "Calendar" in the sidebar. You will see a full monthly calendar view of all your scheduled sessions.',
            fil: 'I-click ang "Calendar" sa sidebar. Makikita mo ang buong buwanang kalendaryo ng lahat ng iyong naka-schedule na session.',
          },
          {
            en: 'Click any date or the "Add Session" button to schedule a new session. Fill in the title, time, type (Lecture / Hands-on / Workshop / Assessment), and room number.',
            fil: 'I-click ang anumang petsa o ang "Add Session" button para mag-schedule ng bagong session. Punan ang pamagat, oras, uri (Lecture / Hands-on / Workshop / Assessment), at numero ng silid.',
          },
          {
            en: "Session types are color-coded on the calendar: Lecture (grey), Hands-on (green), Workshop (blue), Assessment (yellow).",
            fil: "May kulay-kodigo ang mga uri ng session sa kalendaryo: Lecture (grey), Hands-on (green), Workshop (blue), Assessment (yellow).",
          },
          {
            en: 'Use the arrow buttons (◄ ►) to navigate between months. A "Sessions This Month" panel on the right lists all events.',
            fil: 'Gamitin ang mga arrow button (◄ ►) para lumipat sa pagitan ng mga buwan. Nakalista sa "Sessions This Month" panel sa kanan ang lahat ng event.',
          },
          {
            en: "To remove a session, click the trash icon (🗑️) in the session list on the right side.",
            fil: "Para tanggalin ang isang session, i-click ang trash icon (🗑️) sa listahan ng session sa kanang bahagi.",
          },
        ],
      },
      {
        id: "trainer-evaluate",
        icon: Users,
        title: {
          en: "Viewing & Evaluating Your Trainees",
          fil: "Pagtingin at Pag-evaluate ng Iyong mga Trainees",
        },
        steps: [
          {
            en: 'Click "My Trainees" in the sidebar to see all trainees assigned to you.',
            fil: 'I-click ang "My Trainees" sa sidebar para makita ang lahat ng trainee na naka-assign sa iyo.',
          },
          {
            en: "Each trainee card shows their name, progress bar, program, payment status (Paid badge), and current evaluation badge.",
            fil: "Ipinapakita ng bawat trainee card ang kanilang pangalan, progress bar, programa, payment status (Paid badge), at kasalukuyang evaluation badge.",
          },
          {
            en: 'To evaluate a trainee: Click "Evaluate" on their card. Enter a skill name, select a rating (Certified / Competent / Needs Improvement), add notes, then click "Submit Evaluation".',
            fil: 'Para i-evaluate ang isang trainee: I-click ang "Evaluate" sa kanilang card. Maglagay ng pangalan ng skill, pumili ng rating (Certified / Competent / Needs Improvement), magdagdag ng notes, pagkatapos i-click ang "Submit Evaluation".',
          },
          {
            en: "Ratings automatically update the trainee's badge: Certified (🟢) = high performance, Competent (🟡) = mid-level, Needs Improvement (🔴) = below standard.",
            fil: "Awtomatikong ina-update ng mga rating ang badge ng trainee: Certified (🟢) = mataas na performance, Competent (🟡) = katamtaman, Needs Improvement (🔴) = mababa sa pamantayan.",
          },
          {
            en: 'You can click "Undo Evaluation" to revert a completed evaluation if you need to make corrections.',
            fil: 'Maaari mong i-click ang "Undo Evaluation" para ibalik ang isang nakumpletong evaluation kung kailangan mong gumawa ng mga pagwawasto.',
          },
        ],
      },
      {
        id: "trainer-modules",
        icon: Upload,
        title: {
          en: "Uploading Learning Modules",
          fil: "Pag-upload ng mga Learning Module",
        },
        steps: [
          {
            en: 'Click "Modules" in the sidebar. Here you can see and manage all learning materials for your program.',
            fil: 'I-click ang "Modules" sa sidebar. Dito mo makikita at mapapamahalaan ang lahat ng learning materials para sa iyong programa.',
          },
          {
            en: 'Fill in the module title, choose the file type (PDF, MP4, or DOCX), set the unit number, and click "Upload Module".',
            fil: 'Punan ang pamagat ng module, piliin ang uri ng file (PDF, MP4, o DOCX), itakda ang unit number, at i-click ang "Upload Module".',
          },
          {
            en: 'Uploaded modules are immediately visible to all your trainees in their "Materials" section (once their payment is verified).',
            fil: 'Agad na makikita ng lahat ng iyong trainee ang mga na-upload na module sa kanilang "Materials" section (kapag na-verify na ang kanilang bayad).',
          },
          {
            en: "To remove a module, click the trash icon (🗑️) beside it.",
            fil: "Para tanggalin ang isang module, i-click ang trash icon (🗑️) sa tabi nito.",
          },
        ],
      },
      {
        id: "trainer-assignments",
        icon: ClipboardList,
        title: {
          en: "Creating & Managing Assignments",
          fil: "Paglikha at Pamamahala ng mga Assignment",
        },
        steps: [
          {
            en: 'Click "Assignments" in the sidebar. You will see a list of all assignments you have created.',
            fil: 'I-click ang "Assignments" sa sidebar. Makikita mo ang listahan ng lahat ng assignment na nagawa mo.',
          },
          {
            en: 'Click "New Assignment". Enter the title, description, due date and time, and optionally link a calendar event. Then click "Post Assignment".',
            fil: 'I-click ang "New Assignment". Ilagay ang pamagat, deskripsyon, due date at oras, at opsyonal na mag-link ng calendar event. Pagkatapos i-click ang "Post Assignment".',
          },
          {
            en: 'Click "View Submissions" on any assignment to see which trainees have submitted and their uploaded file links.',
            fil: 'I-click ang "View Submissions" sa anumang assignment para makita kung sinong mga trainee ang nagsumite at ang kanilang mga na-upload na file link.',
          },
          {
            en: "To delete an assignment, click the trash icon (🗑️) next to it.",
            fil: "Para burahin ang isang assignment, i-click ang trash icon (🗑️) sa tabi nito.",
          },
        ],
      },
      {
        id: "trainer-join-community",
        icon: Globe,
        title: { en: "Joining a Community", fil: "Pagsali sa isang Community" },
        steps: [
          {
            en: 'Click "Forum" in the navigation bar, then switch to the "Communities" tab.',
            fil: 'I-click ang "Forum" sa navigation bar, pagkatapos lumipat sa "Communities" tab.',
          },
          {
            en: "Browse or search for communities by name, topic, or region. Click on a community card to view its details and members.",
            fil: "Mag-browse o maghanap ng mga community ayon sa pangalan, paksa, o rehiyon. I-click ang isang community card para makita ang mga detalye at miyembro nito.",
          },
          {
            en: 'Click "Join Community". If it is a public community, you join instantly. If private, your request will be sent to the admin for approval.',
            fil: 'I-click ang "Join Community". Kung public na community ito, agad kang sasali. Kung private, ipapadala ang iyong request sa admin para sa approval.',
          },
        ],
      },
      {
        id: "trainer-moderate-community",
        icon: ShieldCheck,
        title: {
          en: "Moderating a Community",
          fil: "Pag-moderate ng isang Community",
        },
        steps: [
          {
            en: "If an admin grants you the Moderator role in a community, a gold shield badge appears next to the community name and new moderation controls become available.",
            fil: "Kung bibigyan ka ng admin ng Moderator role sa isang community, may lalabas na gold shield badge sa tabi ng pangalan ng community at magiging available ang mga bagong moderation control.",
          },
          {
            en: 'For each pending post, you can click "Approve" to publish it or "Reject" to decline. Approved posts immediately become visible to all members.',
            fil: 'Para sa bawat pending post, maaari mong i-click ang "Approve" para i-publish ito o "Reject" para tanggihan. Agad na makikita ng lahat ng miyembro ang mga naaprubahang post.',
          },
          {
            en: "Click the Pin button on any post to keep it at the top of the community feed. Click Unpin to remove the pin.",
            fil: "I-click ang Pin button sa anumang post para panatilihin ito sa itaas ng community feed. I-click ang Unpin para alisin ang pin.",
          },
          {
            en: 'Click "Edit" on the About card or Rules card to update the community description or rule list. Changes are saved instantly and logged in the audit log.',
            fil: 'I-click ang "Edit" sa About card o Rules card para i-update ang deskripsyon o listahan ng rules ng community. Agad na naise-save ang mga pagbabago at nakatala sa audit log.',
          },
          {
            en: "Use the Members panel to add a new member by email, promote a member to moderator (gold shield icon), or remove a member from the community.",
            fil: "Gamitin ang Members panel para magdagdag ng bagong miyembro gamit ang email, i-promote ang isang miyembro bilang moderator (gold shield icon), o alisin ang isang miyembro sa community.",
          },
        ],
      },
    ],
  },
  {
    id: "trainee",
    icon: GraduationCap,
    label: { en: "Trainee", fil: "Mag-aaral" },
    accent: "green",
    description: {
      en: "You learn, download materials, submit assignments, track your progress, earn badges, and download your official E-Certificate.",
      fil: "Ikaw ang nag-aaral, nagda-download ng mga materyales, nagsusumite ng mga assignment, sinusubaybayan ang iyong progreso, kumikita ng mga badge, at nagda-download ng iyong opisyal na E-Certificate.",
    },
    sections: [
      {
        id: "trainee-login",
        icon: LogIn,
        title: { en: "How to Log In", fil: "Paano Mag-Login" },
        steps: [
          {
            en: 'Go to the website. Click the "Login" button at the top-right corner.',
            fil: 'Pumunta sa website. I-click ang "Login" button sa kanang sulok sa itaas.',
          },
          {
            en: 'Type your email and password. Click "Sign In" to enter.',
            fil: 'I-type ang iyong email at password. I-click ang "Sign In" para pumasok.',
          },
          {
            en: 'If you forgot your password, click "Forgot Password?" and follow the steps to reset it via email.',
            fil: 'Kung nakalimutan mo ang iyong password, i-click ang "Forgot Password?" at sundin ang mga hakbang para i-reset ito sa pamamagitan ng email.',
          },
          {
            en: 'After logging in, click your name at the top-right, then click "Trainee Dashboard".',
            fil: 'Pagkatapos mag-login, i-click ang iyong pangalan sa kanang itaas, pagkatapos i-click ang "Trainee Dashboard".',
          },
        ],
      },
      {
        id: "trainee-dashboard",
        icon: LayoutGrid,
        title: {
          en: "Your Dashboard at a Glance",
          fil: "Ang Iyong Dashboard sa Isang Sulyap",
        },
        steps: [
          {
            en: "The dashboard overview shows your current badge, training progress %, enrolled program, and upcoming session schedule.",
            fil: "Ipinapakita ng dashboard overview ang iyong kasalukuyang badge, porsyento ng progreso sa training, naka-enroll na programa, at paparating na session schedule.",
          },
          {
            en: "Active trainees see these sidebar tabs: My Dashboard, Session Schedule, Assignments, Enrolled Programs, Materials, and Credentials.",
            fil: "Makikita ng mga aktibong trainee ang mga sidebar tab na ito: My Dashboard, Session Schedule, Assignments, Enrolled Programs, Materials, at Credentials.",
          },
          {
            en: "If you have already graduated, your sidebar simplifies to: My Dashboard and Credentials. You can re-enroll in a new program from the dashboard.",
            fil: "Kung nakapagtapos ka na, ang iyong sidebar ay magiging simple: My Dashboard at Credentials. Maaari kang mag-re-enroll sa bagong programa mula sa dashboard.",
          },
          {
            en: "Your progress bar shows how far along you are in your training. 100% means you have completed all modules.",
            fil: "Ipinapakita ng iyong progress bar kung gaano ka na kalayo sa iyong training. Ang 100% ay nangangahulugang nakumpleto mo na ang lahat ng module.",
          },
        ],
      },
      {
        id: "trainee-enrolled-program",
        icon: BookOpen,
        title: {
          en: "Checking Your Enrolled Program",
          fil: "Pagtingin sa Iyong Enrolled Program",
        },
        steps: [
          {
            en: 'Click "Enrolled Programs" in the sidebar. You will see your current program, trainer name, batch, and payment status.',
            fil: 'I-click ang "Enrolled Programs" sa sidebar. Makikita mo ang iyong kasalukuyang programa, pangalan ng trainer, batch, at payment status.',
          },
          {
            en: "The program card shows: Program name, Trainer, Batch, Start date, Sessions count, Materials count, and your completion percentage.",
            fil: "Ipinapakita ng program card: pangalan ng Programa, Trainer, Batch, petsa ng pagsisimula, bilang ng Sessions, bilang ng Materials, at ang iyong completion percentage.",
          },
          {
            en: 'If you see "Payment Pending", the Admin has not yet confirmed your payment. Wait for the approval notification.',
            fil: 'Kung makikita mo ang "Payment Pending", hindi pa kinukumpirma ng Admin ang iyong bayad. Maghintay para sa approval notification.',
          },
        ],
      },
      {
        id: "trainee-session-schedule",
        icon: Calendar,
        title: {
          en: "Viewing Your Session Schedule",
          fil: "Pagtingin sa Iyong Session Schedule",
        },
        steps: [
          {
            en: 'Click "Session Schedule" in the sidebar. A calendar will appear showing all your training sessions.',
            fil: 'I-click ang "Session Schedule" sa sidebar. Lalabas ang isang kalendaryo na nagpapakita ng lahat ng iyong training session.',
          },
          {
            en: "Colored dots on the calendar show which days have sessions. Click a date to see the full session details (time, title, trainer, room, type).",
            fil: "Ipinapakita ng mga may-kulay na tuldok sa kalendaryo kung aling mga araw may session. I-click ang isang petsa para makita ang buong detalye ng session (oras, pamagat, trainer, silid, uri).",
          },
          {
            en: "Session types are color-coded: Green = Hands-on, Blue = Workshop, Yellow = Assessment, Grey = Lecture.",
            fil: "May kulay-kodigo ang mga uri ng session: Green = Hands-on, Blue = Workshop, Yellow = Assessment, Grey = Lecture.",
          },
          {
            en: 'Use the "Today (PH)" button to jump back to the current date. Use the ◄ ► arrows to navigate months.',
            fil: 'Gamitin ang "Today (PH)" button para bumalik sa kasalukuyang petsa. Gamitin ang ◄ ► arrows para lumipat ng buwan.',
          },
        ],
      },
      {
        id: "trainee-materials",
        icon: FileText,
        title: {
          en: "Downloading Learning Materials",
          fil: "Pag-download ng mga Learning Materials",
        },
        steps: [
          {
            en: 'Click "Materials" in the sidebar. You will see all the modules and files your trainer uploaded for your program.',
            fil: 'I-click ang "Materials" sa sidebar. Makikita mo ang lahat ng module at file na na-upload ng iyong trainer para sa iyong programa.',
          },
          {
            en: "Materials are locked (🔒) until your payment has been verified by the Admin. Once verified, all materials will unlock automatically.",
            fil: "Naka-lock (🔒) ang mga materyales hanggang ma-verify ng Admin ang iyong bayad. Kapag na-verify na, awtomatikong mag-a-unlock ang lahat ng materyales.",
          },
          {
            en: "Click the download icon (↓) beside any unlocked module to save it to your device. Materials are organized by unit number — start from Unit 1.",
            fil: "I-click ang download icon (↓) sa tabi ng anumang naka-unlock na module para i-save ito sa iyong device. Nakaayos ang mga materyales ayon sa unit number — magsimula sa Unit 1.",
          },
          {
            en: "Supported file types: PDF (document), MP4 (video), and DOCX (Word document). The file type icon on each card shows what format it is.",
            fil: "Suportadong uri ng file: PDF (document), MP4 (video), at DOCX (Word document). Ipinapakita ng file type icon sa bawat card kung anong format ito.",
          },
        ],
      },
      {
        id: "trainee-assignments",
        icon: ClipboardList,
        title: {
          en: "Submitting Assignments",
          fil: "Pagsumite ng mga Assignment",
        },
        steps: [
          {
            en: 'Click "Assignments" in the sidebar to see all assignments from your trainer.',
            fil: 'I-click ang "Assignments" sa sidebar para makita ang lahat ng assignment mula sa iyong trainer.',
          },
          {
            en: "Each assignment card shows the title, description, due date and time, and your submission status.",
            fil: "Ipinapakita ng bawat assignment card ang pamagat, deskripsyon, due date at oras, at ang status ng iyong submission.",
          },
          {
            en: 'To submit: Click "Submit" on the assignment, paste your Google Drive link (or file link) in the text box, then click "Submit Assignment".',
            fil: 'Para magsumite: I-click ang "Submit" sa assignment, i-paste ang iyong Google Drive link (o file link) sa text box, pagkatapos i-click ang "Submit Assignment".',
          },
          {
            en: 'Once submitted, you will see a green "Submitted" badge on the assignment card. You can re-submit to update your answer before the deadline.',
            fil: 'Kapag naisumite na, makikita mo ang berdeng "Submitted" badge sa assignment card. Maaari kang mag-re-submit para i-update ang iyong sagot bago ang deadline.',
          },
        ],
      },
      {
        id: "trainee-badges",
        icon: Medal,
        title: {
          en: "Your Badges & Credentials",
          fil: "Ang Iyong mga Badge at Credentials",
        },
        steps: [
          {
            en: 'Click "Credentials" in the sidebar. This page has three sections: Verified Trainee Badge, Trained Graduate Badge, and Official E-Certificate.',
            fil: 'I-click ang "Credentials" sa sidebar. Ang page na ito ay may tatlong seksyon: Verified Trainee Badge, Trained Graduate Badge, at Official E-Certificate.',
          },
          {
            en: '"Verified Trainee" badge (🛡️) unlocks once your payment is confirmed by the Admin. It proves you are an officially enrolled trainee.',
            fil: 'Nagiging unlocked ang "Verified Trainee" badge (🛡️) kapag kinumpirma na ng Admin ang iyong bayad. Pinapatunayan nito na ikaw ay isang opisyal na naka-enroll na trainee.',
          },
          {
            en: '"Trained Graduate" badge (🎓) unlocks when your trainer marks you as fully evaluated. It shows your completion badge: Certified (🟢), Competent (🟡), or Needs Improvement (🔴).',
            fil: 'Nagiging unlocked ang "Trained Graduate" badge (🎓) kapag minarkahan ka ng iyong trainer bilang fully evaluated. Ipinapakita nito ang iyong completion badge: Certified (🟢), Competent (🟡), o Needs Improvement (🔴).',
          },
          {
            en: 'The "Official E-Certificate" section shows your unique Certificate ID (e.g. HT-2026-A-T001), issued program, batch, and trainer.',
            fil: 'Ipinapakita ng seksyong "Official E-Certificate" ang iyong natatanging Certificate ID (hal. HT-2026-A-T001), inisyung programa, batch, at trainer.',
          },
          {
            en: 'The certificate is locked until your training is complete. Once unlocked, click "Download Certificate" to preview it.',
            fil: 'Naka-lock ang certificate hanggang makumpleto ang iyong training. Kapag naka-unlock na, i-click ang "Download Certificate" para i-preview ito.',
          },
        ],
      },
      {
        id: "trainee-certificate",
        icon: ScrollText,
        title: {
          en: "Downloading Your E-Certificate",
          fil: "Pag-download ng Iyong E-Certificate",
        },
        steps: [
          {
            en: 'Go to Credentials in the sidebar, then scroll to the "Official E-Certificate" section. Click "Download Certificate" to open the preview.',
            fil: 'Pumunta sa Credentials sa sidebar, pagkatapos mag-scroll sa seksyong "Official E-Certificate". I-click ang "Download Certificate" para buksan ang preview.',
          },
          {
            en: "A full-screen preview modal will appear showing your complete A4 landscape certificate with your name, program, trainer signature, and official seal.",
            fil: "May lalabas na full-screen preview modal na nagpapakita ng iyong kumpletong A4 landscape certificate kasama ang iyong pangalan, programa, lagda ng trainer, at opisyal na selyo.",
          },
          {
            en: 'In the preview modal, click "Print / Save PDF" at the top. Your browser\'s print dialog will open — choose "Save as PDF" as the destination to save a digital copy.',
            fil: 'Sa preview modal, i-click ang "Print / Save PDF" sa itaas. Magbubukas ang print dialog ng iyong browser — piliin ang "Save as PDF" bilang destination para makapag-save ng digital na kopya.',
          },
          {
            en: "The certificate includes your full name, program title, completion date, trainer name, Certificate ID, and the HardTech IT Corp official logo and SEC registration.",
            fil: "Kasama sa certificate ang iyong buong pangalan, pamagat ng programa, petsa ng pagkumpleto, pangalan ng trainer, Certificate ID, at ang opisyal na logo at SEC registration ng HardTech IT Corp.",
          },
          {
            en: "Click the X button (top-left of the modal) or press Escape to close the preview without printing.",
            fil: "I-click ang X button (kaliwang itaas ng modal) o pindutin ang Escape para isara ang preview nang hindi nagpi-print.",
          },
        ],
      },
      {
        id: "trainee-re-enroll",
        icon: RefreshCw,
        title: {
          en: "Re-Enrolling in a New Program",
          fil: "Pag-re-enroll sa Bagong Program",
        },
        steps: [
          {
            en: 'After graduating, you will see a "Browse Programs" button on your dashboard. Click it to see other available programs.',
            fil: 'Pagkatapos makapagtapos, makikita mo ang "Browse Programs" button sa iyong dashboard. I-click ito para makita ang iba pang available na programa.',
          },
          {
            en: 'Program cards show the title, trainer, price, and available slots. Click "Enroll" on any program you wish to join.',
            fil: 'Ipinapakita ng program cards ang pamagat, trainer, presyo, at available na slots. I-click ang "Enroll" sa anumang programang gusto mong salihan.',
          },
          {
            en: "The re-enrollment process is the same as the first enrollment: select payment method, upload proof of payment, then wait for Admin approval.",
            fil: "Ang proseso ng re-enrollment ay pareho sa unang enrollment: piliin ang paraan ng pagbabayad, mag-upload ng patunay ng bayad, pagkatapos maghintay ng Admin approval.",
          },
        ],
      },
      {
        id: "trainee-forum",
        icon: MessageSquare,
        title: { en: "Using the Forum", fil: "Paggamit ng Forum" },
        steps: [
          {
            en: 'Click "Forum" in the navigation bar to go to the community discussion board.',
            fil: 'I-click ang "Forum" sa navigation bar para pumunta sa community discussion board.',
          },
          {
            en: 'To create a post: Click "New Post", choose a category, write your title and content, add tags (up to 5), and optionally attach images or videos. Then click "Submit Post".',
            fil: 'Para lumikha ng post: I-click ang "New Post", pumili ng category, isulat ang iyong title at nilalaman, magdagdag ng tags (hanggang 5), at maaaring mag-attach ng mga larawan o video. Tapos i-click ang "Submit Post".',
          },
          {
            en: "Important: As a trainee, your posts need Admin approval before they appear publicly. You will get a notification when approved.",
            fil: "Mahalaga: Bilang trainee, ang iyong mga post ay kailangan ng Admin approval bago lumabas sa publiko. Makakatanggap ka ng notification kapag na-approve na.",
          },
          {
            en: "You can like posts (👍), reply to them, bookmark them, and sort posts by trending, newest, or most replied.",
            fil: "Maaari kang mag-like ng mga post (👍), mag-reply sa kanila, mag-bookmark ng mga ito, at mag-sort ng posts ayon sa trending, pinakabago, o pinaka-maraming reply.",
          },
        ],
      },
      {
        id: "trainee-communities",
        icon: Globe,
        title: {
          en: "Joining & Using Communities",
          fil: "Pagsali at Paggamit ng mga Community",
        },
        steps: [
          {
            en: 'In the Forum page, click the "Communities" tab to browse all available communities.',
            fil: 'Sa Forum page, i-click ang "Communities" tab para mag-browse ng lahat ng available na community.',
          },
          {
            en: "You can filter communities by topic, region, or visibility (public/private). The system may also suggest communities based on your region in the Philippines (highlighted with a ⚡ icon).",
            fil: "Maaari kang mag-filter ng mga community ayon sa paksa, rehiyon, o visibility (public/private). Maaari ring magmungkahi ang system ng mga community batay sa iyong rehiyon sa Pilipinas (minarkahan ng ⚡ icon).",
          },
          {
            en: 'Click "Join" on any community. Public communities let you in immediately. Private communities require Admin approval.',
            fil: 'I-click ang "Join" sa anumang community. Ang mga public community ay agad kang papasukan. Ang mga private community ay nangangailangan ng Admin approval.',
          },
          {
            en: "Inside a community, you can post updates, comment on others' posts, and interact with members from your area.",
            fil: "Sa loob ng community, maaari kang mag-post ng mga update, mag-comment sa mga post ng iba, at makipag-ugnayan sa mga miyembro mula sa iyong lugar.",
          },
        ],
      },
      {
        id: "trainee-leaderboard",
        icon: Trophy,
        title: {
          en: "Forum Leaderboard & Reputation",
          fil: "Forum Leaderboard at Reputasyon",
        },
        steps: [
          {
            en: 'Open the Forum page and click "Leaderboard" to see top contributors ranked by reputation points.',
            fil: 'Buksan ang Forum page at i-click ang "Leaderboard" para makita ang mga nangungunang kontribyutor na inirarangko ayon sa reputation points.',
          },
          {
            en: "You earn reputation when your posts get upvotes, your replies are marked helpful, and your content stays approved by moderators. The top 3 contributors get gold, silver, and bronze badges next to their name.",
            fil: "Nakakakuha ka ng reputation kapag na-upvote ang iyong mga post, namarkahan bilang helpful ang iyong mga reply, at nananatiling approved ang iyong content ng mga moderator. Ang top 3 na kontribyutor ay makakatanggap ng gold, silver, at bronze badge sa tabi ng kanilang pangalan.",
          },
          {
            en: "Use the leaderboard to find experienced trainees and trainers you can learn from — click their name to see their public posts and contributions.",
            fil: "Gamitin ang leaderboard para makakita ng mga makaranasang trainee at trainer na maaari mong matutunan — i-click ang kanilang pangalan para makita ang kanilang mga public post at kontribusyon.",
          },
        ],
      },
      {
        id: "trainee-report-content",
        icon: Flag,
        title: {
          en: "Reporting Inappropriate Content",
          fil: "Pag-report ng Hindi Angkop na Content",
        },
        steps: [
          {
            en: "If you see a post, reply, or community that violates the rules (spam, harassment, off-topic, etc.), hover over it and click the small flag icon (🚩).",
            fil: "Kung makakita ka ng post, reply, o community na lumalabag sa mga alituntunin (spam, harassment, off-topic, atbp.), i-hover dito at i-click ang maliit na flag icon (🚩).",
          },
          {
            en: "A report dialog will open. Choose a reason (Spam, Harassment, Misinformation, Off-topic, Other) and optionally write a short note explaining what is wrong.",
            fil: "May magbubukas na report dialog. Pumili ng dahilan (Spam, Harassment, Misinformation, Off-topic, Other) at opsyonal na sumulat ng maikling paliwanag kung ano ang mali.",
          },
          {
            en: 'Click "Submit Report". Moderators and admins will review your report and take action. You will see a confirmation toast, and you will get a notification if your report is acted on.',
            fil: 'I-click ang "Submit Report". Susuriin ng mga moderator at admin ang iyong report at gagawan ng aksyon. Makakakita ka ng confirmation toast, at makakatanggap ka ng notification kapag naaksyunan na ang iyong report.',
          },
          {
            en: "Reports are anonymous to the reported user. Do not abuse the reporting system — false reports may affect your own standing.",
            fil: "Anonymous ang mga report sa user na ni-report. Huwag abusuhin ang reporting system — ang mga maling report ay maaaring makaapekto sa iyong sariling standing.",
          },
        ],
      },
      {
        id: "trainee-notifications",
        icon: Bell,
        title: {
          en: "Reading Your Notifications",
          fil: "Pagbabasa ng mga Notification",
        },
        steps: [
          {
            en: "Look for the bell icon (🔔) in the top navigation bar. A red number shows how many unread notifications you have.",
            fil: "Hanapin ang bell icon (🔔) sa itaas na navigation bar. Ipinapakita ng pulang numero kung ilang unread notification mayroon ka.",
          },
          {
            en: 'Click the bell to open the notification panel. You will see updates like: "Your post was approved", "New assignment posted", "Payment confirmed", or "Certificate approved".',
            fil: 'I-click ang bell para buksan ang notification panel. Makikita mo ang mga update tulad ng: "Your post was approved", "New assignment posted", "Payment confirmed", o "Certificate approved".',
          },
          {
            en: 'Click a notification to go directly to that page. Click "Mark all read" to remove the red counter. The system keeps your last 20 notifications.',
            fil: 'I-click ang isang notification para direktang pumunta sa page na iyon. I-click ang "Mark all read" para alisin ang pulang counter. Itinatago ng system ang iyong huling 20 notification.',
          },
        ],
      },
    ],
  },
];

export const HELP_TIP: Bilingual = {
  en: "Tip: Click any section below to expand it.",
  fil: "Payo: I-click ang anumang seksyon sa ibaba para palawakin ito.",
};
