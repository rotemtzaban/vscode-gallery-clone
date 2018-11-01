/// {type:}
const fileUpload = document.getElementById('file');
fileUpload.oninput = () => {
    fileUpload.disabled = true;
    const file = fileUpload.files[0];
    const xhr = new XMLHttpRequest();
    const form = new FormData();
    form.append('extension', file);
    let promise = new Promise((resolve, reject) => {
        xhr.open('POST', '/api/extensionUpload');
        xhr.onload = function() {
            if (this.status >= 200 && this.status < 300) {
                resolve(this.response);
            } else {
                reject({
                    response: this.response,
                    status: this.status,
                    statusText: this.statusText
                });
            }

            xhr.onerror = function() {
                reject({
                    response: this.response,
                    status: this.status,
                    statusText: this.statusText
                });
            };
        };
    });

    xhr.send(form);
    promise
        .then(() => {
            fileUpload.value = '';
            fileUpload.disabled = false;
            alert('upload succeded');
        })
        .catch(err => {
            fileUpload.value = '';
            fileUpload.disabled = false;
            alert(JSON.stringify(err));
        });
};
