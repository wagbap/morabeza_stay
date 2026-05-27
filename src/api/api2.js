// src/config/api.js
export const API_CONFIG = {
    BASE_URL: import.meta.env.DEV 
        ? 'https://welovepalop.com/api'
        : 'https://welovepalop.com/api',
    TIMEOUT: 30000,
    ENDPOINTS: {
        ALOJAMENTO: {
            REGISTAR: '/alojamento/registar.php',
            ATUALIZAR: '/alojamento/atualizar.php',
            BUSCAR: '/alojamento/buscar.php',
            MEUS: '/alojamento/meus_alojamentos.php',
            EXCLUIR: '/alojamento/excluir.php',
            COMODIDADES: '/alojamento/buscar_comodidades.php',
            COMODIDADES_SELECAO: '/alojamento/buscar_comodidades_com_selecao.php',
            REGRAS: '/alojamento/buscar_regras.php',
            REGRAS_SALVAR: '/alojamento/salvar_regras.php',
            IMAGENS: '/alojamento/imagens.php'
        }
    }
};

export const API_URL = API_CONFIG.BASE_URL;