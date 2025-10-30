// Elementos do DOM
const locationBtn = document.getElementById('location-btn');
const locationStatus = document.getElementById('location-status');
const resultContainer = document.getElementById('result-container');
const cityCards = document.querySelectorAll('.city-card');

// Informações sobre cidades de PE
const CIDADES_PE = {
    'Recife': {
        titulo: '🏙️ Recife - Capital de Pernambuco',
        descricao: 'Conhecida como "Veneza Brasileira" por seus rios, pontes e manguezais. Centro econômico e cultural do estado.',
        detalhes: {
            'Fundação': '1537',
            'População': '1,6 milhão',
            'Área': '218 km²',
            'Gentílico': 'Recifense',
            'Pontos Turísticos': 'Marco Zero, Praia de Boa Viagem, Oficina Brennand'
        }
    },
    'Olinda': {
        titulo: '🎨 Olinda - Patrimônio Mundial',
        descricao: 'Cidade histórica tombada pela UNESCO, famosa pelo carnaval de rua e arquitetura colonial.',
        detalhes: {
            'Fundação': '1535',
            'População': '390 mil',
            'Área': '41 km²',
            'Gentílico': 'Olindense',
            'Pontos Turísticos': 'Alto da Sé, Igreja da Misericórdia, Carnaval de Rua'
        }
    },
    'Caruaru': {
        titulo: '🎪 Caruaru - Capital do Agreste',
        descricao: 'Famosa pelo maior São João do mundo e pela feira de artesanato, uma das maiores da América Latina.',
        detalhes: {
            'Fundação': '1857',
            'População': '365 mil',
            'Área': '920 km²',
            'Gentílico': 'Caruaruense',
            'Pontos Turísticos': 'Alto do Moura, Feira de Caruaru, Pátio de Eventos'
        }
    },
    'Petrolina': {
        titulo: '🍇 Petrolina - Vale do São Francisco',
        descricao: 'Polo de fruticultura irrigada, banhada pelo Rio São Francisco, fronteira com a Bahia.',
        detalhes: {
            'Fundação': '1895',
            'População': '360 mil',
            'Área': '4.559 km²',
            'Gentílico': 'Petrolinense',
            'Pontos Turísticos': 'Orla de Petrolina, Vinícolas, Catedral'
        }
    }
};

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    setupEventListeners();
    checkGeolocationSupport();
});

// Configurar event listeners
function setupEventListeners() {
    locationBtn.addEventListener('click', handleGeolocation);
    
    // Adicionar clique nas cidades
    cityCards.forEach(card => {
        card.addEventListener('click', () => {
            const cityName = card.getAttribute('data-city');
            showCityInfo(cityName);
        });
    });
}

// Verificar suporte a geolocalização
function checkGeolocationSupport() {
    if (!navigator.geolocation) {
        locationBtn.disabled = true;
        locationBtn.innerHTML = '📍 Geolocalização Não Suportada';
    }
}

// Handler principal da geolocalização
async function handleGeolocation() {
    try {
        showLocationStatus('📍 Detectando sua localização...');
        locationBtn.disabled = true;
        locationBtn.innerHTML = '<span class="loading"></span> Localizando...';

        // Obter coordenadas
        const position = await getCurrentPosition();
        const { latitude, longitude } = position.coords;
        
        showLocationStatus('🌍 Convertendo coordenadas...');

        // Converter coordenadas em cidade
        const locationData = await getLocationFromCoords(latitude, longitude);
        
        // Verificar se está em PE
        if (locationData.state !== 'Pernambuco') {
            showError('Você não está em Pernambuco. Mostrando informações sobre Recife.');
            showCityInfo('Recife');
            return;
        }

        // Mostrar informações da cidade detectada
        if (CIDADES_PE[locationData.city]) {
            showCityInfo(locationData.city, true);
        } else {
            showCityInfo('Recife', true); // Fallback para Recife
        }
        
    } catch (error) {
        console.error('Erro na geolocalização:', error);
        handleGeolocationError(error);
    } finally {
        locationBtn.disabled = false;
        locationBtn.innerHTML = '🗺️ Descobrir Minha Cidade';
        setTimeout(() => hideLocationStatus(), 3000);
    }
}

// Obter posição atual
function getCurrentPosition() {
    return new Promise((resolve, reject) => {
        navigator.geolocation.getCurrentPosition(resolve, reject, {
            enableHighAccuracy: true,
            timeout: 10000,
            maximumAge: 60000
        });
    });
}

// API: Converter coordenadas em localização
async function getLocationFromCoords(lat, lon) {
    try {
        const response = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&accept-language=pt`
        );
        
        if (!response.ok) throw new Error('Erro na API');
        
        const data = await response.json();
        
        // Simulação para teste - REMOVA EM PRODUÇÃO
        if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
            console.log('🔧 Modo desenvolvimento: simulando Recife');
            return {
                city: 'Recife',
                state: 'Pernambuco',
                country: 'Brasil'
            };
        }
        
        if (!data.address) throw new Error('Localização não encontrada');
        
        return {
            city: data.address.city || data.address.town || data.address.village || 'Recife',
            state: data.address.state || 'Pernambuco',
            country: data.address.country
        };
        
    } catch (error) {
        console.error('Erro API:', error);
        // Fallback para Recife
        return {
            city: 'Recife',
            state: 'Pernambuco',
            country: 'Brasil'
        };
    }
}

// Mostrar informações da cidade
function showCityInfo(cityName, fromGeolocation = false) {
    const cityData = CIDADES_PE[cityName];
    
    if (!cityData) {
        showError('Cidade não encontrada');
        return;
    }
    
    let html = `
        <div class="city-result fade-in">
            <div class="city-name">${cityData.titulo}</div>
            <div class="city-info">${cityData.descricao}</div>
            <div class="city-details">
    `;
    
    // Adicionar detalhes
    Object.entries(cityData.detalhes).forEach(([chave, valor]) => {
        html += `
            <div class="detail-item">
                <span><strong>${chave}:</strong></span>
                <span>${valor}</span>
            </div>
        `;
    });
    
    html += `</div></div>`;
    
    if (fromGeolocation) {
        html = `
            <div class="success-message">
                ✅ Localização detectada! Você está em ${cityName}.
            </div>
            ${html}
        `;
    }
    
    resultContainer.innerHTML = html;
    showLocationStatus('✅ Informações carregadas!', 'success');
}

// Handler de erros
function handleGeolocationError(error) {
    let errorMessage = 'Erro desconhecido';
    
    switch(error.code) {
        case error.PERMISSION_DENIED:
            errorMessage = 'Permissão de localização negada. Clique em uma cidade abaixo.';
            break;
        case error.POSITION_UNAVAILABLE:
            errorMessage = 'Localização indisponível. Clique em uma cidade abaixo.';
            break;
        case error.TIMEOUT:
            errorMessage = 'Tempo esgotado. Clique em uma cidade abaixo.';
            break;
        default:
            errorMessage = error.message || 'Erro ao obter localização';
    }
    
    showError(errorMessage);
    showLocationStatus(errorMessage, 'error');
}

// Mostrar status
function showLocationStatus(message, type = 'info') {
    locationStatus.classList.remove('hidden');
    const statusText = locationStatus.querySelector('.status-text');
    const statusIcon = locationStatus.querySelector('.status-icon');
    
    statusText.textContent = message;
    
    if (type === 'success') {
        locationStatus.style.background = '#d4edda';
        locationStatus.style.borderLeftColor = '#28a745';
        statusIcon.textContent = '✅';
    } else if (type === 'error') {
        locationStatus.style.background = '#f8d7da';
        locationStatus.style.borderLeftColor = '#dc3545';
        statusIcon.textContent = '❌';
    } else {
        locationStatus.style.background = '#fff3cd';
        locationStatus.style.borderLeftColor = '#ffc107';
        statusIcon.textContent = '📍';
    }
}

function hideLocationStatus() {
    locationStatus.classList.add('hidden');
}

// Mostrar erro
function showError(message) {
    resultContainer.innerHTML = `
        <div class="error-message">
            <strong>❌ Erro:</strong> ${message}
            <div style="margin-top: 10px;">
                <strong>🎯 Clique em uma cidade abaixo para ver informações:</strong>
            </div>
        </div>
    `;
}

// Teste automático em desenvolvimento
if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
    setTimeout(() => {
        console.log('🔧 Modo desenvolvimento ativo');
    }, 1000);
}