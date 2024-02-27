// Function to generate HTML content
function generateHtmlContent(formData) {
    let htmlContent = `<!DOCTYPE html>
    <html lang="en">
    <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Contact Form Response</title>
    <style>
    body {
        font-family: Arial, sans-serif;
        background-color: #f0f0f0;
        padding: 20px;
    }
    .container {
        max-width: 600px;
        margin: 0 auto;
        background-color: #fff;
        padding: 20px;
        border-radius: 10px;
        box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
    }
    label {
        font-weight: bold;
    }
    </style>
    </head>
    <body>
    <div class="container">
    <h2>Contact Form Response</h2>`;

    // Add form data to the HTML content
    for (const key in formData) {
        htmlContent += `<label>${key}:</label><p>${formData[key]}</p>`;
    }

    // Add closing HTML tags
    htmlContent += `</div>
    </body>
    </html>`;

    return htmlContent;
}

// Function to handle errors
function handleConfigError(error) {
  // Display the error message
  const errorMessage = document.createElement('p');
  errorMessage.textContent = 'Error loading configuration: ' + error.message;
  document.body.appendChild(errorMessage);

  // Hide other elements
  const container = document.querySelector('.container');
  container.style.display = 'none';
}

// Set form action (mailto) from config.json
fetch('config.json')
.then(response => response.json())
.then(data => {
    const form = document.getElementById('contact-form');
    const email = data.email;
    form.setAttribute('action', 'mailto:' + email);

    // Set form backend URL if available and not null
    const formBackendUrl = data.form_backend_url;
    if (formBackendUrl !== undefined && formBackendUrl !== null) {
       form.setAttribute('action', formBackendUrl);
       form.setAttribute('enctype', 'application/x-www-form-urlencoded');
    }

    // Update email placeholder in instructions
    const emailPlaceholder = document.getElementById('emailPlaceholder');
    emailPlaceholder.textContent = email;

    // Add click event listener to copy email to clipboard
    emailPlaceholder.addEventListener('click', () => {
        const tempInput = document.createElement('input');
        tempInput.value = email;
        document.body.appendChild(tempInput);
        tempInput.select();
        document.execCommand('copy');
        document.body.removeChild(tempInput);
        alert('Email copied to clipboard: ' + email);
    });
});

// Fetching and populating form fields from config.json
fetch('config.json')
.then(response => {
  // Alert user if config.json unreachable
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})
.then(data => {
    const form = document.getElementById('contact-form');
    const formData = {}; // Object to store form data

    // Alert user if email key not found
    if (!data.email) {
        throw new Error('Email address not found in config.json');
    }

    // Iterate over questions in config.json
    data.questions.forEach(question => {
        // Create labels for each question
        const label = document.createElement('label');
        label.textContent = question.label + ':';
        label.style.color = '#ddd'; // Light text color
        form.appendChild(label);
        form.appendChild(document.createElement('br'));

        // Create input elements for each question
        const input = document.createElement(question.type === 'textarea' ? 'textarea' : 'input');
        input.setAttribute('type', question.type);
        input.setAttribute('name', question.name);
        input.setAttribute('data-label', question.label); // Store label text as data attribute
        if (question.type === 'textarea') {
            input.setAttribute('rows', '4');
        }
        if (question.required) {
            input.setAttribute('required', '');
        }
        form.appendChild(input);
        form.appendChild(document.createElement('br'));
    });

    // Setup form submission button
    const send_button = document.createElement('button');
    send_button.setAttribute('type', 'submit');
    send_button.textContent = 'Send';
    form.appendChild(send_button);

    // Setup form download button
    const download_html_button = document.createElement('button');
    download_html_button.setAttribute('type', 'button');
    download_html_button.textContent = 'Download Form';
    download_html_button.addEventListener('click', () => {
        const inputs = form.querySelectorAll('input, textarea');
        let valid = true;

        inputs.forEach(input => {
            if (input.hasAttribute('required') && !input.value.trim()) {
                valid = false;
                input.style.borderColor = 'red'; // Highlight required fields in red
            } else {
                input.style.borderColor = '#555'; // Reset border color
            }
            // Store form data
            formData[input.getAttribute('data-label')] = input.value;
        });

        if (valid) {
            // Generate HTML content
            const htmlContent = generateHtmlContent(formData);

            // Create a Blob containing the HTML content
            const blob = new Blob([htmlContent], { type: 'text/html' });

            // Create a download link
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'contact_form_response.html';

            // Append the link to the body and click it programmatically
            document.body.appendChild(link);
            link.click();

            // Remove the link from the body
            document.body.removeChild(link);
        } else {
            alert('Please fill out all required fields.');
        }
    });
    form.appendChild(download_html_button);
})
.catch(error => {
        handleConfigError(error);
});