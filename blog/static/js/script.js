let blog = document.querySelector('#saveblog');
let count = 1;

blog.addEventListener('click', () => {
    let title = document.querySelector('#b-title').value.trim();
    let date = document.querySelector('#b-date').value.trim();
    let content = document.querySelector('#b-content').value.trim();

    let titleError = document.getElementById('titleError');
    let dateError = document.getElementById('dateError');
    let contentError = document.getElementById('contentError');

    let error = 0;

    if (title === '') {
        titleError.classList.remove('d-none');
        error = 1;
    } else {
        titleError.classList.add('d-none');
    }

    if (date === '') {
        dateError.classList.remove('d-none');
        error = 1;
    } else {
        dateError.classList.add('d-none');
    }

    if (content === '') {
        contentError.classList.remove('d-none');
        error = 1;
    } else {
        contentError.classList.add('d-none');
    }

    if (error) return;

    fetch('/blog/', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            title: title,
            date: date,
            content: content
        })
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            let cardContainer = document.querySelector('#card');
            let card = `<div class="col-md-4 mb-3">
                <a href="/blog/${data.id}/" style="text-decoration: none; color: inherit;">
                    <div class="card h-100">
                        <div class="card-body">
                            <h5 class="card-title">Blog Title : ${title}</h5>
                        </div>
                    </div>
                </a>
            </div>`;
            
            cardContainer.innerHTML = card + cardContainer.innerHTML;

            let modal = bootstrap.Modal.getInstance(document.getElementById('myModal'));
            modal.hide();

            Swal.fire({
                title: 'Success!',
                text: 'Blog submitted successfully!',
                icon: 'success',
                timer: 1500,
                showConfirmButton: false,
                position: 'center'
            });

            document.querySelector('#b-title').value = '';
            document.querySelector('#b-date').value = '';
            document.querySelector('#b-content').value = '';
        } else {
            alert('Failed to save blog');
        }
    })
    .catch(error => {
        alert('Error submitting blog');
        console.error(error);
    });
});




