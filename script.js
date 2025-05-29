document.addEventListener('DOMContentLoaded', () => {
    // --- Common Functions for all pages ---

    function getLocalStorageItem(key, defaultValue) {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (e) {
            console.error(`Error parsing localStorage item "${key}":`, e);
            return defaultValue;
        }
    }

    function setLocalStorageItem(key, value) {
        try {
            localStorage.setItem(key, JSON.stringify(value));
        } catch (e) {
            console.error(`Error setting localStorage item "${key}":`, e);
        }
    }

    // Initialize users and votes if they don't exist
    let users = getLocalStorageItem('voters', []); // Array of user objects
    let votes = getLocalStorageItem('votes', {}); // Object mapping candidate ID to vote count
    let candidates = getLocalStorageItem('candidates', [
        { id: 'candidateA', name: 'Mario' },
        { id: 'candidateB', name: 'Jose' },
        { id: 'candidateC', name: 'Vladimir' },
        { id: 'candidateD', name: 'Gr' },
        { id: 'candidateE', name: 'Gisel' },
        { id: 'candidateF', name: 'Maria' },
        { id: 'candidateG', name: 'Steve' },
        { id: 'candidateH', name: 'Jaime' },
        { id: 'candidateI', name: 'Redy' },
        { id: 'candidateJ', name: 'Erick' }
    ]);

    // Initialize vote counts for new candidates
    candidates.forEach(candidate => {
        if (votes[candidate.id] === undefined) {
            votes[candidate.id] = 0;
        }
    });
    setLocalStorageItem('votes', votes);
    setLocalStorageItem('candidates', candidates); // Ensure candidates are stored

    // Logout functionality
    const logoutButton = document.getElementById('logoutButton');
    if (logoutButton) {
        logoutButton.addEventListener('click', () => {
            localStorage.removeItem('loggedInUser');
            window.location.href = 'index.html';
        });
    }

    // Get current page name
    const currentPage = window.location.pathname.split('/').pop();

    // --- Logic for index.html (Login/Registration) ---
    if (currentPage === 'index.html' || currentPage === '') {
        const loginForm = document.getElementById('loginForm');
        const createAccountLink = document.getElementById('createAccountLink');
        const forgotPasswordLink = document.getElementById('forgotPasswordLink');

        const createAccountModal = new bootstrap.Modal(document.getElementById('createAccountModal'));
        const forgotPasswordModal = new bootstrap.Modal(document.getElementById('forgotPasswordModal'));

        const createAccountForm = document.getElementById('createAccountForm');
        const forgotPasswordForm = document.getElementById('forgotPasswordForm');

        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const username = document.getElementById('username').value;
                const password = document.getElementById('password').value;

                const user = users.find(u => u.ci === username && u.password === password);

                if (user) {
                    localStorage.setItem('loggedInUser', JSON.stringify({ ci: user.ci, name: user.name, hasVoted: user.hasVoted || false }));
                    alert('¡Inicio de sesión exitoso!');
                    window.location.href = 'vote.html';
                } else {
                    alert('CI o contraseña incorrectos.');
                }
            });
        }

        if (createAccountLink) {
            createAccountLink.addEventListener('click', (e) => {
                e.preventDefault();
                createAccountModal.show();
            });
        }

        if (forgotPasswordLink) {
            forgotPasswordLink.addEventListener('click', (e) => {
                e.preventDefault();
                forgotPasswordModal.show();
            });
        }

        if (createAccountForm) {
            createAccountForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const regCi = document.getElementById('regCi').value;
                const regName = document.getElementById('regName').value;
                const regLastname = document.getElementById('regLastname').value;
                const regEmail = document.getElementById('regEmail').value;
                const regTel = document.getElementById('regTel').value;
                const regDepartment = document.getElementById('regDepartment').value;
                const regBirthDate = document.getElementById('regBirthDate').value;
                const regPassword = document.getElementById('regPassword').value;

                if (users.some(u => u.ci === regCi)) {
                    alert('Ya existe una cuenta con este CI.');
                    return;
                }
// Expresión regular para validar contraseñas
            const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

          
                // // Validar contraseña
                // if (!passwordRegex.test(regPassword.value)) {
                //     contraseñaError.textContent = 'La contraseña debe tener al menos 8 caracteres, incluyendo una mayúscula, una minúscula, un número y un carácter especial.';
                //     return;
                // }
                const newUser = {
                    ci: regCi,
                    name: regName,
                    lastname: regLastname,
                    email: regEmail,
                    tel: regTel,
                    department: regDepartment,
                    birthDate: regBirthDate,
                    password: regPassword,
                    hasVoted: false // New users haven't voted yet
                };
                users.push(newUser);
                setLocalStorageItem('voters', users);
                alert('Cuenta creada exitosamente. Ahora puedes iniciar sesión.');
                createAccountModal.hide();
                createAccountForm.reset(); // Clear the form
            });
        }

        if (forgotPasswordForm) {
            forgotPasswordForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const forgotCi = document.getElementById('forgotCi').value;
                const newPassword = document.getElementById('newPassword').value;

                const userIndex = users.findIndex(u => u.ci === forgotCi);

                if (userIndex !== -1) {
                    users[userIndex].password = newPassword;
                    setLocalStorageItem('voters', users);
                    alert('Contraseña restablecida exitosamente. Ahora puedes iniciar sesión con tu nueva contraseña.');
                    forgotPasswordModal.hide();
                    forgotPasswordForm.reset(); // Clear the form
                } else {
                    alert('CI no encontrado.');
                }
            });
        }
    }

    // --- Logic for vote.html (Voting) ---
    if (currentPage === 'vote.html') {
        const loggedInUser = getLocalStorageItem('loggedInUser', null);
        if (!loggedInUser) {
            window.location.href = 'index.html'; // Redirect if not logged in
            return;
        }

        const voterNameSpan = document.getElementById('voterName');
        if (voterNameSpan) {
            const foundUser = users.find(u => u.ci === loggedInUser.ci);
            if (foundUser) {
                voterNameSpan.textContent = foundUser.name;
                loggedInUser.hasVoted = foundUser.hasVoted; // Update hasVoted from stored user
                setLocalStorageItem('loggedInUser', loggedInUser); // Update localStorage
            } else {
                voterNameSpan.textContent = 'Usuario Desconocido'; // Fallback
            }
        }

        const candidatesList = document.getElementById('candidatesList');
        const voteForm = document.getElementById('voteForm');
        const voteButton = document.getElementById('voteButton');

        if (candidatesList) {
            candidates.forEach(candidate => {
                const div = document.createElement('div');
                div.classList.add('form-check');
                div.innerHTML = `
                    <input class="form-check-input" type="radio" name="candidate" id="${candidate.id}" value="${candidate.id}">
                    <label class="form-check-label" for="${candidate.id}">
                        ${candidate.name}
                    </label>
                `;
                candidatesList.appendChild(div);
            });
        }

        if (loggedInUser.hasVoted) {
            alert('Ya has votado en estas elecciones.');
            if (voteForm) voteForm.style.display = 'none'; // Hide the form
        }

        if (voteForm) {
            voteForm.addEventListener('submit', (e) => {
                e.preventDefault();

                if (loggedInUser.hasVoted) {
                    alert('Ya has votado en estas elecciones.');
                    return;
                }

                const selectedCandidate = document.querySelector('input[name="candidate"]:checked');

                if (selectedCandidate) {
                    const candidateId = selectedCandidate.value;
                    votes[candidateId] = (votes[candidateId] || 0) + 1;
                    setLocalStorageItem('votes', votes);

                    // Mark user as voted
                    const userIndex = users.findIndex(u => u.ci === loggedInUser.ci);
                    if (userIndex !== -1) {
                        users[userIndex].hasVoted = true;
                        setLocalStorageItem('voters', users);
                        loggedInUser.hasVoted = true; // Update local loggedInUser object
                        setLocalStorageItem('loggedInUser', loggedInUser); // Update localStorage
                    }

                    alert('¡Voto registrado con éxito!');
                    window.location.href = 'results.html'; // Redirect to results after voting
                } else {
                    alert('Por favor, selecciona un candidato antes de votar.');
                }
            });
        }
    }

    // --- Logic for results.html (Results Display) ---
    if (currentPage === 'results.html') {
        const resultsDisplay = document.getElementById('resultsDisplay');
        if (resultsDisplay) {
            let resultsHtml = '<h4>Conteo de Votos:</h4><ul>';
            let totalVotes = 0;

            candidates.forEach(candidate => {
                const count = votes[candidate.id] || 0;
                resultsHtml += `<li>${candidate.name}: ${count} votos</li>`;
                totalVotes += count;
            });
            resultsHtml += `</ul><p><strong>Total de Votos Emitidos: ${totalVotes}</strong></p>`;
            resultsDisplay.innerHTML = resultsHtml;
        }
    }
});