


    document.getElementById('submit').addEventListener('click', async function (event) {
        const list = document.getElementById('list');
        try {
            const r = await fetch('http://127.0.0.1:8080/api/square', {
                method: 'POST',
                body: document.getElementById('number').value
            });

            if (r.ok) {
                const body = await r.text()
                const newElement = document.createElement('li');
                newElement.textContent = body;
                list.insertBefore(newElement, list.firstChild);
                plot_REST_points(scene, body)
            } else {
                console.error(r)
            };
        } catch (err) {
            console.error(err)
        }
    })
