// web dev gif imports--------------------------------------
import githubSearch from './vid_githubOrgSearch.gif'
import mmConverter from './vid_milimeterConverter.gif'
import passwordGenerator from './vid_passwordGenerator.gif'
import weatherDashboard from './vid_weatherDashboard.gif'
import jsQuiz from './vid_jsQuiz.gif'
import communityCookbook from './vid_communityCookbook.gif'
import artistPortfolio from './artist-portfolio.gif'
// artwork imports------------------------------------------
import photo1 from './personalWork/photo-1.jpeg'
import photo2 from './personalWork/photo-2.jpeg'
import photo4 from './personalWork/photo-4.jpeg'
import photo5 from './personalWork/photo-5.jpeg'
import photo6 from './personalWork/photo-6.jpeg'
import photo7 from './personalWork/photo-7.jpeg'
import photo9 from './personalWork/photo-9.jpeg'
import photo10 from './personalWork/photo-10.jpeg'
import photo11 from './personalWork/photo-11.jpeg'
import photo12 from './personalWork/photo-12.jpeg'
import photo13 from './personalWork/photo-13.jpeg'
import photo14 from './personalWork/photo-14.jpeg'
import photo16 from './personalWork/photo-16.jpeg'
import photo17 from './personalWork/photo-17.jpeg'
import photo18 from './personalWork/photo-18.jpeg'
import photo19 from './personalWork/photo-19.jpeg'
import photo21 from './personalWork/photo-21.jpeg'
import photo22 from './personalWork/photo-22.jpeg'
import photo23 from './personalWork/photo-23.jpeg'
import photo24 from './personalWork/photo-24.jpeg'
import photo25 from './personalWork/photo-25.jpeg'
import photo26 from './personalWork/photo-26.jpeg'

export interface Project {
  title: string
  path: string
  alt: string
  description: string
  website?: string
  link?: string
}

export interface Artwork {
  path: string
  alt: string
}

export const projects: Project[] = [
  {
    title: 'Zipdrug / CarelonRx',
    path: 'https://imgs.search.brave.com/HpTwQ4RF9ZsfgqncMjjsGelbymXKjdOqwz6LkbNI_uk/rs:fit:860:0:0/g:ce/aHR0cHM6Ly9tZWRp/YS5saWNkbi5jb20v/ZG1zL2ltYWdlL0M1/NjFCQVFIRXExcDV3/Uy16MVEvY29tcGFu/eS1iYWNrZ3JvdW5k/XzEwMDAwLzAvMTU4/NTQ0MTEyMzk3Mi96/aXBkcnVnX2NvdmVy/P2U9MjE0NzQ4MzY0/NyZ2PWJldGEmdD12/VDRBQlp6R0U3QkVN/WTNVb1NKRlEwNkpX/bFRJMnZoUUw1a0F5/VVVWaGow',
    alt: 'Zipdrug / CarelonRx website',
    description:
      'As part of a collaborative full-stack team, I contributed to the development of a sophisticated pharmacy delivery service website for a company that later became part of Elevance Health. Leveraging modern technologies such as JavaScript, Python, React.js, Redux, Apollo Provider, Twilio, Higher Order Components, Sequelize, and Node.js, the platform was designed to meet the rigorous standards of the healthcare industry. \n Responsibilities encompassed both frontend and backend tasks. On the frontend, the focus was on crafting intuitive user interfaces using React.js and Redux. Meanwhile, backend duties involved developing endpoints, architecting GraphQL schemas, and managing large datasets containing protected health information (PHI).Throughout the project, emphasis was placed on ensuring the security and integrity of user data, particularly PHI. Additional responsibilities included integrating Twilio communication functionalities seamlessly into the platform, enhancing overall functionality and user engagement.\n This experience provided valuable opportunities to refine skills across a diverse technology stack and address complex challenges in a dynamic and demanding environment.',
    website: 'https://github.com/zipdrug',
  },
  {
    title: 'Artist Portfolio',
    path: artistPortfolio,
    alt: 'artists portfolio',
    description:
      "An artist's portfolio website built with React, React Router, Ant Design, and AntD Icon libraries. Navigate through a curated collection of artwork seamlessly organized into intuitive categories. With React's dynamic rendering and React Router's smooth navigation, browse through the artist's diverse portfolio effortlessly. The elegant UI elements from Ant Design enhance the aesthetic appeal, while the rich variety of AntD icons adds visual depth to every page. Experience a visually stunning and user-friendly platform to showcase the artist's talent and creativity.",
    website: 'https://www.spudmd.com/',
    link: 'https://github.com/Sea-Chels/Aaron-Portfolio',
  },
  {
    title: 'React Github Repository Search',
    path: githubSearch,
    alt: 'Github Repository search',
    description:
      "Designed as a quick project to demonstrate my React.js skills, this application showcased the integration of GitHub's repository search API into a functional React-based platform. By using asynchronous API calls, it fetched and displayed search results dynamically, highlighting its responsiveness and efficiency. \n Built with React, JavaScript, Express, and GitHub Pages, the project exemplified my ability to utilize modern technologies to create robust web applications. Despite the tight deadline, I focused on delivering a user-friendly experience while ensuring smooth performance. \n This project reflects my dedication to mastering React.js and my commitment to delivering quality results under pressure.",
    website: 'https://Sea-Chels.github.io/Github-Org-Search-App',
    link: 'https://github.com/Sea-Chels/Github-Org-Search-App',
  },
  {
    title: 'Community Cookbook',
    path: communityCookbook,
    alt: 'community cookbook',
    description:
      "The Community Cookbook project aimed to simplify recipe exploration by allowing users to discover dishes based on ingredients they have at home while also showcasing the favorite recipes of various authors. My main contribution focused on refining the website's styling to ensure a more visually appealing and user-friendly interface.\n In collaboration with the team, I primarily focused on integrating APIs and developing RESTful APIs to enhance the platform's functionality. Additionally, I played a role in designing the frontend of the website to provide users with an intuitive browsing experience. Leveraging technologies like MongoDB, React, Express, Apollo Provider, and GraphQL, we created a robust platform capable of efficiently handling data interactions. \n Despite the project's modest origins, we worked together effectively to deliver a functional Community Cookbook that met our objectives. Through this experience, I gained valuable insights into frontend development, API integration, and collaborative project management.",
    link: 'https://github.com/pjkingsley/Group_Project_3',
  },
  {
    title: 'React Millimeter Converter',
    path: mmConverter,
    alt: 'A gif of a wepage containing a simple input box that converts inches to millimeters',
    description:
      "This application simplifies the conversion process from inches to millimeters. With Electron.js, it's transformed into a standalone .exe file for easy access on Windows, even without an internet connection. \n Originally designed for a CAD designer's convenience, this tool offers a straightforward solution that remains readily available, separate from standard browser windows. By combining Electron, React, and JavaScript, I created a user-friendly app tailored to meet specific needs.",
    website: 'https://sea-chels.github.io/aarons-converter/',
    link: 'https://github.com/Sea-Chels/aarons-converter',
  },
  {
    title: 'Password Generator',
    path: passwordGenerator,
    alt: 'An input box on a webpage that has a popup box asking what you want in your password, then generates it based on user input.',
    description:
      'This intuitive password generator employs confirm prompt boxes to tailor password criteria, allowing users to select preferences for numbers, symbols, capital letters, and lowercase letters. With user input as the foundation, it generates a personalized password, ensuring both security and ease of use.',
    website: 'https://sea-chels.github.io/Password-Generator/',
    link: 'https://github.com/Sea-Chels/Password-Generator',
  },
  {
    title: 'Weather Dashboard',
    path: weatherDashboard,
    alt: 'A weather dashboard',
    description:
      'A weather dashboard created to deliver detailed forecasts for cities across the United States. This meticulously crafted application offers not only the upcoming five-day forecast but also essential weather metrics such as UV index, temperature fluctuations, wind speeds, and humidity levels. With its user-friendly interface and intuitive design, navigating through weather data has never been easier. Powered by a trusted third-party weather API, this dashboard ensures reliability and accuracy in providing real-time weather information. Stay informed and prepared for any weather condition with this sophisticated yet accessible weather tracking tool.',
    website: 'https://sea-chels.github.io/Weather-Dashboard/',
    link: 'https://github.com/Sea-Chels/Weather-Dashboard',
  },
  {
    title: 'JavaScript Quiz',
    path: jsQuiz,
    alt: 'soon to be project',
    description:
      'An interactive JavaScript syntax quiz designed to challenge your knowledge while adding a touch of enjoyment with engaging questions. Crafted using basic JavaScript comparisons, the quiz seamlessly verifies answer accuracy, shuffles questions dynamically, calculates scores effortlessly, and enhances complexity by randomizing answer options for each question. Leveraging Vanilla JavaScript, this quiz serves as an effective learning resource, offering an immersive experience for participants.',
    link: 'https://github.com/Sea-Chels/JS-Quiz',
  },
]

export const artworks: Artwork[] = [
  {
    path: photo1,
    alt: 'soon to be project',
  },
  {
    path: photo2,
    alt: 'soon to be project',
  },
  {
    path: photo4,
    alt: 'soon to be project',
  },
  {
    path: photo24,
    alt: 'soon to be project',
  },
  {
    path: photo5,
    alt: 'soon to be project',
  },
  {
    path: photo25,
    alt: 'soon to be project',
  },
  {
    path: photo26,
    alt: 'soon to be project',
  },
  {
    path: photo6,
    alt: 'soon to be project',
  },
  {
    path: photo7,
    alt: 'soon to be project',
  },
  {
    path: photo9,
    alt: 'soon to be project',
  },
  {
    path: photo10,
    alt: 'soon to be project',
  },
  {
    path: photo11,
    alt: 'soon to be project',
  },
  {
    path: photo12,
    alt: 'soon to be project',
  },
  {
    path: photo13,
    alt: 'soon to be project',
  },
  {
    path: photo14,
    alt: 'soon to be project',
  },
  {
    path: photo16,
    alt: 'soon to be project',
  },
  {
    path: photo17,
    alt: 'soon to be project',
  },
  {
    path: photo18,
    alt: 'soon to be project',
  },
  {
    path: photo19,
    alt: 'soon to be project',
  },
  {
    path: photo21,
    alt: 'soon to be project',
  },
  {
    path: photo22,
    alt: 'soon to be project',
  },
  {
    path: photo23,
    alt: 'soon to be project',
  },
]
