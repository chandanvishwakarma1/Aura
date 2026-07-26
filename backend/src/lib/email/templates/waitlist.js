export const waitlistTemplate = ({ name }) => `
<!DOCTYPE html>
<html>

<head>
    <style>
        body {
            font-family: 'DM Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            background: #f4f4f4;
            padding: 20px;
        }

        .card {
            background: #fff;
            padding: 24px;
            border-radius: 8px;
            max-width: 480px;
            margin: auto;
        }

        .header {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 24px;
        }

        .position {
            font-size: 18px;
            color: #4f46e5;
            font-weight: bold;
            margin: 16px 0;
        }

        .footer {
            color: #777;
            font-size: 12px;
            margin-top: 24px;
        }

        .logo {
            display: flex;
            align-items: center;
            justify-self: center;
            margin: 16px 0px;
        }

        .footer-logo {
            justify-self: center;
        }
        .footer-text {
            text-align: center;
        }
        .footer-body-text{
            width: 80%;
            justify-self: center;
        }
        .footer-text{
            color: #777;
        }
        .social-logo{
            justify-self: center;
        }
    </style>
</head>

<body>
    <div class="card">
        <div class="logo">
            <svg width="48" height="32" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                    d="M35.3036 2.51349C34.3127 2.5919 33.5461 2.79814 32.1713 3.56972C31.2092 4.13642 30.692 4.59876 29.8585 5.33618L28.0556 7.55791M28.0556 7.55791C27.2336 8.84397 26.8611 9.60872 26.2892 11.018C25.6856 12.9372 25.3476 13.8905 25.2511 15.2429C25.0948 16.4938 25.2549 17.1734 25.7975 18.357C26.2425 18.9433 26.5568 19.2095 27.5275 19.3768C28.6206 19.3128 29.0435 19.0629 29.5671 18.357C30.1171 17.3942 30.2022 16.6709 30.1863 15.2429C29.9756 13.5878 29.7878 12.6622 29.3122 11.018C29.3122 11.018 28.5838 8.89703 28.0556 7.55791ZM28.0556 7.55791L26.963 5.15408C26.208 3.7318 25.8842 3.24836 25.4332 2.84128C24.7893 2.10359 24.4653 1.95997 23.7214 1.79529C22.9672 1.78261 22.4467 1.86017 21.7364 2.35983C21.0262 2.85949 20.5718 3.33897 19.9518 4.07165L18.5313 5.93711M18.5313 5.93711C17.5199 7.43696 17.0224 8.38684 16.2914 10.326C15.9963 11.3418 16.0064 11.9416 16.2914 13.0576C16.9154 14.0619 17.3491 14.4974 18.586 14.5691C19.563 14.4898 20.3137 13.9838 20.7348 13.0576C21.0682 12.0435 20.9829 11.1311 20.7348 10.326C20.0874 8.47724 19.6329 7.54418 18.5313 5.93711ZM18.5313 5.93711C17.8387 4.87785 17.3804 4.31227 16.4189 3.2237C15.0157 1.9557 14.3074 1.55203 13.2684 1.78504C12.3264 2.08596 11.7282 2.55773 10.9192 3.73361C10.5007 4.38484 10.3238 4.75222 10.0268 5.35436L9.33481 6.99334M9.33481 6.99334C8.09319 9.62339 7.6184 11.3512 7.05845 14.4416C6.85259 15.9574 6.89338 16.734 7.27698 18.0291C7.8449 19.0642 8.32487 19.3198 9.38944 19.3585C10.2801 19.3351 10.9559 18.9677 11.4291 18.0291C11.8484 17.287 11.9319 16.1385 11.8297 14.4416C11.413 11.4019 10.9456 9.64528 9.33481 6.99334ZM9.33481 6.99334C8.24332 5.6308 7.42387 5.0628 5.85653 5.0812C4.19822 5.22273 3.20079 5.92126 1.72266 7.53967"
                    stroke="black" stroke-width="3.44476" stroke-linecap="round" stroke-linejoin="round" />
            </svg>
            <h2 style="font-size:xx-large;">MemoryLink</h2>
        </div>

        <div class="header"> 🎉You're on the waitlist, ${name}!</div>
        <p class="body-text">Thank you for showing interest in MemoryLink! We're confirming your spot on the waitlist</p>
        <p class="body-text">We're really happy to welcome more users gradually. Hang tight and we will let you know as soons as it your
            turn.</p>
        <p class="body-text">In the meantime, make sure you join our Discord community and check out recent features we've launched or ask
            for the features you want. Have questions? Take a look at the FAQ section on our site.</p>
        <p class="body-text">Thanks for you interest. We'll send you email with information once you're off the waitlist.</p>
        <p class="body-text">--Chandan Vishwakarma</p>

        <!-- <div class="divider"></div> -->
        <hr>
        <div class="footer-body-text">
            <div class="footer-logo">
                <svg width="38" height="22" viewBox="0 0 38 22" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path
                        d="M35.3036 2.51349C34.3127 2.5919 33.5461 2.79814 32.1713 3.56972C31.2092 4.13642 30.692 4.59876 29.8585 5.33618L28.0556 7.55791M28.0556 7.55791C27.2336 8.84397 26.8611 9.60872 26.2892 11.018C25.6856 12.9372 25.3476 13.8905 25.2511 15.2429C25.0948 16.4938 25.2549 17.1734 25.7975 18.357C26.2425 18.9433 26.5568 19.2095 27.5275 19.3768C28.6206 19.3128 29.0435 19.0629 29.5671 18.357C30.1171 17.3942 30.2022 16.6709 30.1863 15.2429C29.9756 13.5878 29.7878 12.6622 29.3122 11.018C29.3122 11.018 28.5838 8.89703 28.0556 7.55791ZM28.0556 7.55791L26.963 5.15408C26.208 3.7318 25.8842 3.24836 25.4332 2.84128C24.7893 2.10359 24.4653 1.95997 23.7214 1.79529C22.9672 1.78261 22.4467 1.86017 21.7364 2.35983C21.0262 2.85949 20.5718 3.33897 19.9518 4.07165L18.5313 5.93711M18.5313 5.93711C17.5199 7.43696 17.0224 8.38684 16.2914 10.326C15.9963 11.3418 16.0064 11.9416 16.2914 13.0576C16.9154 14.0619 17.3491 14.4974 18.586 14.5691C19.563 14.4898 20.3137 13.9838 20.7348 13.0576C21.0682 12.0435 20.9829 11.1311 20.7348 10.326C20.0874 8.47724 19.6329 7.54418 18.5313 5.93711ZM18.5313 5.93711C17.8387 4.87785 17.3804 4.31227 16.4189 3.2237C15.0157 1.9557 14.3074 1.55203 13.2684 1.78504C12.3264 2.08596 11.7282 2.55773 10.9192 3.73361C10.5007 4.38484 10.3238 4.75222 10.0268 5.35436L9.33481 6.99334M9.33481 6.99334C8.09319 9.62339 7.6184 11.3512 7.05845 14.4416C6.85259 15.9574 6.89338 16.734 7.27698 18.0291C7.8449 19.0642 8.32487 19.3198 9.38944 19.3585C10.2801 19.3351 10.9559 18.9677 11.4291 18.0291C11.8484 17.287 11.9319 16.1385 11.8297 14.4416C11.413 11.4019 10.9456 9.64528 9.33481 6.99334ZM9.33481 6.99334C8.24332 5.6308 7.42387 5.0628 5.85653 5.0812C4.19822 5.22273 3.20079 5.92126 1.72266 7.53967"
                        stroke="black" stroke-width="3.44476" stroke-linecap="round" stroke-linejoin="round" />
                </svg>
            </div>
            <p class="footer-text">We would love to see you building your timeline and enjoying with MemoryLink!</p>
            <p class="footer-text">Please tag us & follow us!</p>
            <div class="social-logo">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-facebook-icon lucide-facebook"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-instagram-icon lucide-instagram"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>

            </div>
        </div>
        <div class="footer">
            If you didn't sign up for this, please ignore this email.
        </div>
    </div>
</body>

</html>
`;
