# Technical Research Note

This research note documents technical insights gathered during development regarding standard fetch request status checking.

---

## Technical Reference Details

-   **Source Link:** [MDN Web Docs - Fetch API (Using Fetch)](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API/Using_Fetch)
-   **Search Keywords:** `javascript fetch catch status check response.ok mdn`

---

## ქართული რეზიუმე (Summary in Georgian)

ეს ტექნიკური წყარო დეტალურად განმარტავს `fetch` API-ის მუშაობის პრინციპებსა და მის თავისებურებებს, რომლებიც კრიტიკულად მნიშვნელოვანია შეცდომების სწორი დამუშავებისთვის (Error Handling). კვლევიდან ნათელი გახდა, რომ `fetch()` ფუნქცია არ აგდებს შეცდომას (არ აკეთებს reject-ს) იმ შემთხვევაშიც კი, თუ სერვერი აბრუნებს HTTP 404 ან 500 კოდს. Promise-ის Reject-ი ხდება მხოლოდ მაშინ, როდესაც ფიზიკურად ვერ ხერხდება ქსელთან დაკავშირება (მაგალითად, ინტერნეტი გაითიშა). შესაბამისად, იმისათვის, რომ დარწმუნდეთ, რომ სერვერიდან ინფორმაცია წარმატებით წამოვიღეთ, აუცილებელია შევამოწმოთ `response.ok` ბულეან თვისება. თუ `response.ok` არის `false`, კოდმა ხელით უნდა ისროლოს შეცდომა (`throw new Error`), რათა ის `catch` ბლოკში დამუშავდეს. ეს მიდგომა წარმატებით დავნერგეთ ჩვენს პროექტში კლიენტების ჩატვირთვის, დამატებისა და წაშლის ეტაპებზე.
