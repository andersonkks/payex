let userData = { Payments: [], Salary: 0 };

document.addEventListener("DOMContentLoaded", function() {
    const elements = {
        submitButton: document.getElementById("submitButton"),
        paymentForm: document.getElementById("paymentForm"),
        popup: document.getElementById("popup"),
        tableList: document.getElementById("tableList"),
        searchInput: document.getElementById("searchInput"),
        filterSelect: document.getElementById("filterSelect"),
        salaryInput: document.getElementById("salaryInput"),
        greeting: document.getElementById("greeting"),
        upcomingPayments: document.getElementById("upcomingPayments"),
        controlPanel: document.querySelector(".control-panel")
    };

    elements.submitButton.addEventListener("click", createPayment);
    elements.paymentForm.addEventListener("submit", function(event) {
        event.preventDefault();
    });
    elements.tableList.addEventListener("click", handleTableListClick);
    elements.tableList.addEventListener("change", handleTableListChange);
    elements.searchInput.addEventListener("input", displayPayments);
    elements.filterSelect.addEventListener("change", displayPayments);
    checkLoggedIn();

    function checkLoggedIn() {
        const currentUser = localStorage.getItem("currentUser");
        if (!currentUser) {
            window.location.href = "login.html";
        } else {
            loadUserData(currentUser);
            displayPayments();
        }
    }

    function loadUserData(username) {
        const savedUserData = localStorage.getItem(username);
        if (savedUserData) {
            userData = JSON.parse(savedUserData);
            if (userData.Salary) {
                elements.salaryInput.value = userData.Salary;
                elements.greeting.textContent = username;
            }
            calculateTotals();
        } else {
            window.location.href = "login.html";
        }
    }

    function createPayment() {
        const paymentName = elements.paymentForm.querySelector("#paymentName").value.trim();
        const paymentDate = elements.paymentForm.querySelector("#paymentDate").value.trim();
        const paymentValue = elements.paymentForm.querySelector("#paymentValue").value.trim();

        if (!paymentName || !paymentDate || !paymentValue) {
            showPopup("Por favor, preencha todos os campos.");
            return;
        }

        const payment = {
            name: paymentName,
            date: paymentDate,
            value: parseFloat(paymentValue),
            paid: false
        };

        userData.Payments.push(payment);
        updateUserData();
        calculateTotals();
        showPopup("Pagamento criado com sucesso!");
        displayPayments();

        elements.paymentForm.reset();
    }

    function handleTableListClick(event) {
        const target = event.target;
        if (target.matches(".edit-button")) {
            editPayment(event);
        } else if (target.matches(".delete-button")) {
            deletePayment(event);
        }
    }

    function handleTableListChange(event) {
        const target = event.target;
        if (target.matches(".paid-checkbox")) {
            const tr = target.closest("tr");
            const index = Array.from(tr.parentNode.children).indexOf(tr);
            userData.Payments[index].paid = target.checked;
            updateUserData();
            calculateTotals();
            displayPayments();
        }
    }

    function editPayment(event) {
        const target = event.target;
        const tr = target.closest("tr");
        const index = Array.from(tr.parentNode.children).indexOf(tr);
        const nameTd = tr.querySelector('td:nth-child(1)');
        const dateTd = tr.querySelector('td:nth-child(2)');
        const valueTd = tr.querySelector('td:nth-child(3)');
        const editButton = tr.querySelector('.edit-button');

        nameTd.innerHTML = `<input type="text" class="edit-name" value="${userData.Payments[index].name}">`;
        dateTd.innerHTML = `<input type="date" class="edit-date" value="${userData.Payments[index].date}">`;
        valueTd.innerHTML = `<input type="number" class="edit-value" value="${userData.Payments[index].value}" step="0.01">`;

        editButton.textContent = "Salvar";
        editButton.classList.remove("edit-button");
        editButton.classList.add("save-button");
        editButton.removeEventListener("click", editPayment);
        editButton.addEventListener("click", savePayment);
    }

    function savePayment(event) {
        const target = event.target;
        const tr = target.closest("tr");
        const index = Array.from(tr.parentNode.children).indexOf(tr);
        const nameInput = tr.querySelector('.edit-name');
        const dateInput = tr.querySelector('.edit-date');
        const valueInput = tr.querySelector('.edit-value');

        userData.Payments[index].name = nameInput.value.trim();
        userData.Payments[index].date = dateInput.value.trim();
        userData.Payments[index].value = parseFloat(valueInput.value);
        displayPayments();
    }

    function deletePayment(event) {
        const target = event.target;
        const tr = target.closest("tr");
        const index = Array.from(tr.parentNode.children).indexOf(tr);
        userData.Payments.splice(index, 1);
        updateUserData();
        calculateTotals();
        displayPayments();
    }

    function displayPayments() {
        elements.tableList.innerHTML = "";
        const searchValue = elements.searchInput.value.trim().toLowerCase();
        const filterValue = elements.filterSelect.value;

        const filteredPayments = userData.Payments.filter(payment => {
            if (filterValue === 'date') {
                if (searchValue.includes('-')) {
                    const [startDate, endDate] = searchValue.split('-').map(date => new Date(date.trim().split('/').reverse().join('/')));
                    const paymentDate = new Date(payment.date.split('-').reverse().join('/'));
                    return paymentDate >= startDate && paymentDate <= endDate;
                } else {
                    const formattedDate = payment.date.split('-').reverse().join('/');
                    return formattedDate.includes(searchValue);
                }
            } else {
                const fieldValue = payment[filterValue];
                if (filterValue === 'paid') {
                    return fieldValue;
                } else if (filterValue === 'nopaid') {
                    return !fieldValue;
                } else if (typeof fieldValue === 'string') {
                    return fieldValue.toLowerCase().includes(searchValue);
                } else {
                    return false;
                }
            }
        });

        filteredPayments.forEach(payment => {
            const dateParts = payment.date.split('-');
            const formattedDate = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
            const randomId = Math.floor(Math.random() * 10) + 1;

            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td>${payment.name}</td>
                <td>${formattedDate}</td>
                <td>R$ ${payment.value.toFixed(2)}</td>
                <td><input type="checkbox" id="paid${payment.name + randomId}" class="paid-checkbox" ${payment.paid ? "checked" : ""}></td>
                <td>
                    <button class="edit-button">Editar</button>
                    <button class="delete-button">Excluir</button>
                </td>
            `;
            elements.tableList.appendChild(tr);
        });

        displayUpcomingPayments(filteredPayments);
    }

    function displayUpcomingPayments(filteredPayments) {
        elements.upcomingPayments.innerHTML = "";
        filteredPayments.forEach(payment => {
            const date = new Date(payment.date);
            date.setDate(date.getDate() + 1);
            const today = new Date();
            const fromNow = new Date(today.getTime() + 15 * (24 * 60 * 60 * 1000));

            if (date >= today && date <= fromNow) {
                const dateParts = payment.date.split('-');
                const formatted = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
                
                const li = document.createElement("li");
                li.textContent = `${payment.name} | ${formatted} | R$ ${payment.value.toFixed(2)}`;
                elements.upcomingPayments.appendChild(li);
            }
        });
    }

    function showPopup(message) {
        elements.popup.textContent = message;
        elements.popup.style.display = "block";
        setTimeout(() => {
            elements.popup.style.display = "none";
        }, 3000);
    }

    window.addEventListener("beforeunload", function() {
        if (userData) {
            updateUserData();
        }
    });
});



function control() {
    const controlPanel = document.querySelector(".control-panel");
    controlPanel.classList.toggle("open");
}

function printList() {
    const elementsToHide = document.querySelectorAll('.print-hidden');
    elementsToHide.forEach(element => {
        element.classList.add('hide-for-print');
    });
    window.print();
    elementsToHide.forEach(element => {
        element.classList.remove('hide-for-print');
    });
}

function toggleMenu() {
    var profileMenu = document.getElementById("profileMenu");
    profileMenu.classList.toggle("show");
}

function logoutUser() {
    localStorage.removeItem("currentUser");
    window.location.href = "login.html";
}

function calculateTotals() {
    const elements = {
        totalSpent: document.getElementById("totalSpent"),
        totalPaid: document.getElementById("totalPaid"),
        totalToPay: document.getElementById("totalToPay")
    };

    const totalSpent = userData.Payments.reduce((acc, payment) => acc + payment.value, 0);
    const totalPaid = userData.Payments.reduce((acc, payment) => acc + (payment.paid ? payment.value : 0), 0);
    const totalToPay = userData.Payments.reduce((acc, payment) => acc + (!payment.paid ? payment.value : 0), 0);

    elements.totalSpent.innerHTML = `R$ ${totalSpent.toFixed(2)} <p2>(${(userData.Salary - totalSpent).toFixed(2)})</p2>`;
    elements.totalPaid.innerHTML = `R$ ${totalPaid.toFixed(2)} <p2>(${(userData.Salary - totalPaid).toFixed(2)})</p2>`;
    elements.totalToPay.innerHTML = `R$ ${totalToPay.toFixed(2)} <p2>(${(userData.Salary - totalToPay).toFixed(2)})</p2>`;    
}

function salary() {
    const salary = parseFloat(document.getElementById("salaryInput").value.trim());
    if (!isNaN(salary)) {
        userData.Salary = salary;
        updateUserData();
        calculateTotals(userData);
    } else {
        showPopup("Por favor, insira um valor válido para o salário.");
    }
}

function updateUserData() {
    const currentUser = localStorage.getItem("currentUser");
    if (currentUser) {
        localStorage.setItem(currentUser, JSON.stringify(userData));
    }
}