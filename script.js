
function updateDateTime() {
    const now = new Date();
    const dateTimeDisplay = document.getElementById('currentDateTime');
    if (dateTimeDisplay) {
        dateTimeDisplay.innerText = now.toLocaleString('pt-BR');
    }
}
setInterval(updateDateTime, 1000);

function registerEntryExit(type) {
    const record = {
        type: type,
        timestamp: new Date(),
        location: 'Localização atual',
        edited: false,
        past: false,
        notes: ''
    };
    saveRecord(record);
}

function registerBreak(type) {
    const record = {
        type: `intervalo-${type}`,
        timestamp: new Date(),
        location: 'Localização atual',
        edited: false,
        past: false,
        notes: ''
    };
    saveRecord(record);
}

function addPastEntry() {
    const date = prompt('Informe a data e hora do ponto no passado (YYYY-MM-DD HH:MM)');
    if (!date || new Date(date) > new Date()) {
        alert('Data inválida ou futura.');
        return;
    }
    const record = {
        type: 'ponto-no-passado',
        timestamp: new Date(date),
        location: 'Localização atual',
        edited: false,
        past: true,
        notes: ''
    };
    saveRecord(record);
}

function addAbsence() {
    const reason = document.getElementById('absenceReason').value;
    const file = document.getElementById('fileUpload').files[0];
    if (reason.trim() === '') {
        alert('Por favor, insira uma justificativa.');
        return;
    }

    const record = {
        type: 'ausencia',
        timestamp: new Date(),
        location: 'Localização atual',
        edited: false,
        past: false,
        notes: reason,
        fileName: file ? file.name : null
    };
    saveRecord(record);
    document.getElementById('absenceReason').value = '';
}

function saveRecord(record) {
    let records = JSON.parse(localStorage.getItem('records')) || [];
    records.push(record);
    localStorage.setItem('records', JSON.stringify(records));
    alert('Registro salvo com sucesso!');
}

function renderRecords(filteredRecords = null) {
    const recordsContainer = document.getElementById('recordsContainer');
    if (!recordsContainer) return;

    let records = JSON.parse(localStorage.getItem('records')) || [];
    if (filteredRecords) {
        records = filteredRecords;
    }

    recordsContainer.innerHTML = '';

    let recordsByDate = {};

    records.forEach((record, index) => {
        const date = new Date(record.timestamp).toLocaleDateString('pt-BR');
        if (!recordsByDate[date]) {
            recordsByDate[date] = [];
        }
        recordsByDate[date].push({ record, index });
    });

    for (const [date, recordsOnDate] of Object.entries(recordsByDate)) {
        const dateElement = document.createElement('h3');
        dateElement.textContent = date;
        recordsContainer.appendChild(dateElement);

        recordsOnDate.forEach(({ record, index }) => {
            const recordElement = document.createElement('div');
            recordElement.classList.add('record');
            if (record.edited) recordElement.classList.add('edited');
            if (record.past) recordElement.classList.add('past');

            recordElement.innerHTML = `
                <div>
                    <strong>${record.type}</strong><br>
                    ${new Date(record.timestamp).toLocaleString('pt-BR')} - ${record.location}
                    <p>Notas: ${record.notes || 'Nenhuma'}</p>
                </div>
                <div>
                    <button class="edit" onclick="editRecord(${index})">Editar</button>
                    <button class="delete" onclick="alert('Registros não podem ser excluídos!')">Excluir</button>
                </div>
            `;
            recordsContainer.appendChild(recordElement);
        });
    }
}

function editRecord(index) {
    const records = JSON.parse(localStorage.getItem('records'));
    const newNotes = prompt('Edite as observações do registro:', records[index].notes);
    if (newNotes !== null) {
        records[index].notes = newNotes;
        records[index].edited = true;
        localStorage.setItem('records', JSON.stringify(records));
        renderRecords();
    }
}

function filterRecords() {
    const filter = document.getElementById('filter').value;
    const records = JSON.parse(localStorage.getItem('records')) || [];
    const now = new Date();

    const filteredRecords = records.filter(record => {
        const recordDate = new Date(record.timestamp);
        if (filter === 'week') {
            return (now - recordDate) <= 7 * 24 * 60 * 60 * 1000;
        } else if (filter === 'month') {
            return (now - recordDate) <= 30 * 24 * 60 * 60 * 1000;
        }
        return true;
    });

    renderRecords(filteredRecords);
}

if (window.location.pathname.includes('report.html')) {
    renderRecords();
}
