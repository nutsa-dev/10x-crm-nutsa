# Technical Glossary

This glossary contains definitions for 10 core technical terms used in the 10X CRM project, explained in English and Georgian.

---

## 1. Authentication
*   **English:** The process of verifying the identity of a user, typically via credentials like email and password.
*   **Georgian:** პროცესი, რომლის დროსაც სისტემა ამოწმებს მომხმარებლის ვინაობას – მაგალითად, იმის დადასტურება, რომ შეყვანილი ელფოსტა და პაროლი ნამდვილად ეკუთვნის დარეგისტრირებულ იუზერს.

## 2. Session
*   **English:** A temporary state that keeps a user identified and logged into an application across page reloads.
*   **Georgian:** დროებითი მდგომარეობა (სესია), რომელიც ინახავს მომხმარებლის ავტორიზაციის სტატუსს გვერდების გადატვირთვისას, რათა მას ყოველ წუთს არ დასჭირდეს მონაცემების შეყვანა.

## 3. Validation
*   **English:** The verification process that ensures inputs match required formats and rules before submission.
*   **Georgian:** მონაცემების შემოწმება დადასტურებამდე. მაგალითად, იმის შემოწმება, რომ სახელი არის მინიმუმ 3 ასო, ხოლო პაროლი შეიცავს ციფრებს და ასოებს.

## 4. Fetch
*   **English:** A built-in JavaScript API used for making asynchronous network requests to web servers.
*   **Georgian:** JavaScript-ის ჩაშენებული მეთოდი, რომლის საშუალებითაც ჩვენი აპლიკაცია ასინქრონულად უკავშირდება გარე სერვერებს ინფორმაციის წამოსაღებად ან გასაგზავნად.

## 5. Endpoint
*   **English:** A specific URL address where an API receives requests and returns data resources.
*   **Georgian:** კონკრეტული URL მისამართი სერვერზე, რომელზეც ვაგზავნით რექვესთებს და საიდანაც ვიღებთ პასუხს (მაგალითად: `/users/add` ახალი კლიენტის დასამატებლად).

## 6. Request Method
*   **English:** An HTTP verb (such as GET, POST, or DELETE) indicating the desired action to be performed on a resource.
*   **Georgian:** HTTP მეთოდი (მაგ. GET, POST, DELETE), რომელიც მიუთითებს თუ რა სახის ოპერაცია უნდა შესრულდეს სერვერზე – წაკითხვა, დამატება თუ წაშლა.

## 7. JSON (JavaScript Object Notation)
*   **English:** A lightweight text-based format for storing and exchanging structured data between clients and servers.
*   **Georgian:** ტექსტური ფორმატი მონაცემების გადასაცემად და შესანახად, რომელიც ძალიან მარტივად გარდაიქმნება JavaScript-ის ობიექტებად და მასივებად.

## 8. State
*   **English:** The central data source containing the active status of an application at any given moment.
*   **Georgian:** აპლიკაციის მიმდინარე მდგომარეობა (მონაცემები), რომელიც განსაზღვრავს თუ რა უნდა ეხატოს ეკრანზე (მაგალითად, კლიენტების აქტიური სია `clientsState`).

## 9. Event Listener
*   **English:** A browser mechanism that waits for a specific user action (like click or submit) and triggers a function.
*   **Georgian:** ბრაუზერის ფუნქცია, რომელიც ელოდება მომხმარებლის კონკრეტულ ქმედებას (კლიკი, ფორმის გაგზავნა) და პასუხად უშვებს წინასწარ განსაზღვრულ კოდს.

## 10. Deployment
*   **English:** The process of hosting a web application on a live server (like Vercel or Netlify) to make it publicly accessible online.
*   **Georgian:** პროექტის ატვირთვა და გაშვება გარე სერვერზე (მაგ. Vercel, Netlify), რის შემდეგაც საიტი ხდება ხელმისაწვდომი ინტერნეტში ნებისმიერი ადამიანისთვის.
