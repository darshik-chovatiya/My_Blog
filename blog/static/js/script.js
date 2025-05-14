let saveButton = document.querySelector('#saveblog');
let closeButton = document.querySelector('#closebtn');

let title = document.querySelector('#b-title');
let date = document.querySelector('#b-date');
let content = document.querySelector('#b-content');

if (saveButton) {

    title.addEventListener('input', () =>
        validateField('b-title', 'titleError')
    );

    date.addEventListener('input', () =>
        validateField('b-date', 'dateError')
    );

    content.addEventListener('input', () =>
        validateField('b-content', 'contentError')
    );

    saveButton.addEventListener('click', function () {
        let titleVal = title.value.trim();
        let dateVal = date.value.trim();
        let contentVal = content.value.trim();

        let isTitleValid = validateField('b-title', 'titleError');
        let isDateValid = validateField('b-date', 'dateError') && validateDate(dateVal, document.getElementById('dateError'));
        let isContentValid = validateField('b-content', 'contentError');

        if (!isTitleValid || !isDateValid || !isContentValid) return;

        fetch('/blog/', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                title: titleVal,
                date: dateVal,
                content: contentVal
            })
        })
            .then(res => res.json())
            .then(data => {
                if (data.success) {
                    document.querySelector('#card').insertAdjacentHTML('afterbegin', `
                    <div class="col-md-4 mb-3">
                        <a href="/blog/${data.id}/" style="text-decoration: none; color: inherit;">
                            <div class="card h-100">
                                <div class="card-body">
                                    <h5 class="card-title">${titleVal}</h5>
                                </div>
                            </div>
                        </a>
                    </div>
                `);

                    bootstrap.Modal.getInstance(document.getElementById('myModal')).hide();

                    Swal.fire({
                        title: 'Success!',
                        text: 'Blog submitted successfully!',
                        icon: 'success',
                        showConfirmButton: true,
                        confirmButtonText: 'OK',
                        position: 'center'
                    }).then(() => {
                        resetForm();
                        location.reload();
                    });

                } else {
                    alert('Failed to save blog');
                }

                location.reload();
            })
            .catch(error => {
                alert('Error submitting blog');
                console.error(error);
            });
    });
}


function validateField(fieldId, errorElementId) {
    let field = document.querySelector(`#${fieldId}`);
    let errorElement = document.getElementById(errorElementId);
    if (field.value.trim() === '') {
        errorElement.classList.remove('d-none');
        return false;
    } else {
        errorElement.classList.add('d-none');
        return true;
    }
}

function validateDate(date, errorElement) {
    date = date.trim();
    let regex = /^\d{4}-\d{2}-\d{2}$/;
    if (!regex.test(date)) {
        errorElement.textContent = 'Date must be in DD-MM-YYYY format';
        errorElement.classList.remove('d-none');
        return false;
    }

    let [year, month, day] = date.split('-').map(Number);
    let dateObj = new Date(year, month - 1, day);

    if (
        dateObj.getFullYear() !== year ||
        dateObj.getMonth() + 1 !== month ||
        dateObj.getDate() !== day
    ) {
        errorElement.textContent = 'Invalid date';
        errorElement.classList.remove('d-none');
        return false;
    }

    errorElement.classList.add('d-none');
    return true;
}


closeButton.addEventListener('click', () =>
    resetForm()
);

function resetForm() {
    title.value = '';
    date.value = '';
    content.value = '';

    document.getElementById('titleError').classList.add('d-none');
    document.getElementById('dateError').classList.add('d-none');
    document.getElementById('contentError').classList.add('d-none');
}
