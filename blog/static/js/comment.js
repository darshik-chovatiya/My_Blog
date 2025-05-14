let addCommentBtn = document.getElementById('addComment');
let multiDelete = document.getElementById('deleteSelected');

let blogId = document.getElementById('comment').dataset.blogid;

let commentField = document.getElementById('comment');
let commentError = document.getElementById('commentError');
let commentList = document.getElementById('comment-list');

commentField.addEventListener('input', function () {
    validateCommentField('comment', 'commentError');
});


addCommentBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    let commentField = document.getElementById('comment');
    let comment = commentField.value.trim();
    let commentList = document.getElementById('comment-list');
    let commentError = document.getElementById('commentError');

    if (comment === '') {
        commentError.classList.remove('d-none');
        return;
    } else {
        commentError.classList.add('d-none');
    }

    try {
        let response = await fetch("/save-comment/", {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                comment: comment,
                blog_id: blogId
            })
        });

        let data = await response.json();

        if (data.status === 'ok') {
            let noCommentsMsg = document.getElementById('comments');
            if (noCommentsMsg) {
                noCommentsMsg.remove();
            }

            let div = document.createElement('div');
            div.className = 'border p-2 mb-2';
            div.innerHTML = `<strong>${data.username}</strong><br><p>${data.comment}</p>`;
            commentList.appendChild(div);

            commentField.value = '';
        } else {
            console.log(blogId);
            console.log(data.message);
        }
    } catch (error) {
        console.error('Fetch error:', error);
        alert('Something went wrong.');
    }
    location.reload();
});

function validateCommentField(fieldId, errorId) {
    let field = document.getElementById(fieldId);
    let errorElement = document.getElementById(errorId);

    if (field.value.trim() === '') {
        errorElement.classList.remove('d-none');
        return false;
    } else {
        errorElement.classList.add('d-none');
        return true;
    }
}



async function editComment(commentId) {
    let contentElement = document.getElementById(`content-${commentId}`);
    let oldContent = contentElement.innerText;

    let textarea = document.createElement('textarea');
    textarea.value = oldContent;
    textarea.style.width = '100%';

    let saveBtn = document.createElement('button');
    saveBtn.innerText = 'Save';
    saveBtn.className = 'btn btn-sm btn-outline-primary'
    saveBtn.style.marginRight = '5px';

    let cancelBtn = document.createElement('button');
    cancelBtn.innerText = 'Cancel';
    cancelBtn.className = 'btn btn-sm btn-outline-danger'

    contentElement.innerHTML = '';
    contentElement.appendChild(textarea);
    contentElement.appendChild(saveBtn);
    contentElement.appendChild(cancelBtn);

    saveBtn.addEventListener('click', async function () {
        let newContent = textarea.value.trim();
        if (!newContent) return;

        let response = await fetch('/comment-action/', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ comment_id: commentId, content: newContent })
        });

        let data = await response.json();
        console.log(data);

        if (data.status === 'ok') {
            contentElement.innerText = data.content;
        } else {
            alert(data.message || 'Failed to update comment.');
            contentElement.innerText = oldContent;
        }
    });

    cancelBtn.addEventListener('click', function () {
        contentElement.innerText = oldContent;
    });
}


async function deleteComment(commentId) {

    Swal.fire({
        title: "Are you sure you want to delete this comment?",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Yes, delete it!"
    }).then(async (result) => {
        if (result.isConfirmed) {
            try {
                let response = await fetch('/comment-action/', {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ comment_id: commentId })
                });

                let data = await response.json();

                if (data.status === 'ok') {
                    const element = document.getElementById(`comment-${commentId}`);
                    if (element) element.remove();

                    location.reload();

                } else {
                    Swal.fire("Error", data.message || "Failed to delete comment.", "error");
                }
            } catch (error) {
                Swal.fire("Error", "Something went wrong. Try again later.", "error");
            }
        }
    });

}

multiDelete.addEventListener('click', () => {

    const checkboxes = document.querySelectorAll('.delete-checkbox:checked');
    const commentIds = Array.from(checkboxes).map(cb => cb.dataset.commentid);

    if (commentIds.length === 0) {
        Swal.fire({
            icon: 'warning',
            title: 'No comments selected',
            text: 'Please select at least one comment to delete.',
        });
        return;
    }

    Swal.fire({
        title: 'Are you sure?',
        text: 'This will delete the selected comments permanently.',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#6c757d',
        confirmButtonText: 'Yes, delete them!',
        cancelButtonText: 'Cancel'
    }).then((result) => {
        if (result.isConfirmed) {
            fetch("/delete-comments/", {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRFToken': getCookie('csrftoken')
                },
                body: JSON.stringify({ comment_ids: commentIds })
            }).then(response => {
                    if (!response.ok) throw new Error("Something went wrong");
                    return response.json();
                }).then(data => {
                    if (data.success) {
                        commentIds.forEach(id => {
                            const commentDiv = document.getElementById(`comment-${id}`);
                            if (commentDiv) commentDiv.remove();
                        });

                        Swal.fire({
                            icon: 'success',
                            title: 'Deleted!',
                            text: 'Selected comments have been deleted.',
                            timer: 1500,
                            showConfirmButton: false
                        });
                    } else {
                        Swal.fire({
                            icon: 'error',
                            title: 'Error',
                            text: 'Failed to delete comments. Please try again.'
                        });
                    }
                })
                .catch(error => {
                    console.error('Error:', error);
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: 'An error occurred while deleting comments.'
                    });
                });
                window.location.reload();
        }
    });
});

function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}