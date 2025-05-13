let commentInput = document.getElementById('comment');
let commentList = document.getElementById('comment-list');
let addCommentBtn = document.getElementById('addComment');

let blogId = document.getElementById('comment').dataset.blogid;

addCommentBtn.addEventListener('click', async function (e) {
    e.preventDefault();

    let comment = commentInput.value.trim();
    if (!comment) return alert('Please write something.');

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

            commentInput.value = '';
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



async function editComment(commentId) {
    const newContent = prompt("Edit your comment:");
    if (!newContent) return;

    const response = await fetch('/comment-action/', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId, content: newContent })
    });

    const data = await response.json();

    if (data.status === 'ok') {
        document.getElementById(`content-${commentId}`).innerText = data.content;
    } else {
        alert(data.message || 'Failed to update comment.');
    }

}

async function deleteComment(commentId) {
    const confirmDelete = confirm("Are you sure you want to delete this comment?");
    if (!confirmDelete) return;

    const response = await fetch('/comment-action/', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ comment_id: commentId })
    });

    const data = await response.json();

    if (data.status === 'ok') {
        const element = document.getElementById(`comment-${commentId}`);
        if (element) element.remove();
    } else {
        alert(data.message || 'Failed to delete comment.');
    }
}