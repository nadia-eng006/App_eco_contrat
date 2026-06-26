/**
 * EcoContrat - Client Side Logic & SPA Controller
 * Powered by Antigravity (Google DeepMind)
 */

document.addEventListener('DOMContentLoaded', () => {
    // --- STATE MANAGEMENT ---
    const state = {
        isAuthenticated: false,
        currentUser: null,
        theme: 'dark',
        formData: null
    };

    // --- DOM ELEMENTS CACHE ---
    // Views
    const loginView = document.getElementById('login-view');
    const formView = document.getElementById('form-view');
    const contractPreviewView = document.getElementById('contract-preview-view');
    
    // Header & Navigation
    const userProfile = document.getElementById('user-profile');
    const usernameDisplay = document.getElementById('username-display');
    const logoutBtn = document.getElementById('logout-btn');
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const darkIcon = themeToggleBtn.querySelector('.theme-icon-dark');
    const lightIcon = themeToggleBtn.querySelector('.theme-icon-light');

    // Login Form
    const loginForm = document.getElementById('login-form');
    const loginUsername = document.getElementById('login-username');
    const loginPassword = document.getElementById('login-password');
    const togglePasswordBtn = document.getElementById('toggle-password');
    const loginFeedback = document.getElementById('login-feedback');
    const loginSubmitBtn = document.getElementById('login-submit-btn');

    // Contract Form
    const contractForm = document.getElementById('contract-form');
    const contractTypeSelect = document.getElementById('contract-type');
    const cdiFieldsContainer = document.getElementById('cdi-fields-container');
    const employeePosition = document.getElementById('employee-position');
    const employeeSalary = document.getElementById('employee-salary');
    const hireDateInput = document.getElementById('hire-date');

    // Preview Page
    const summaryFullname = document.getElementById('summary-fullname');
    const summaryType = document.getElementById('summary-type');
    const summaryDate = document.getElementById('summary-date');
    const backToFormBtn = document.getElementById('back-to-form-btn');
    const downloadPdfBtn = document.getElementById('download-pdf-btn');
    const contractPaperContent = document.getElementById('contract-paper-content');

    // Toast Notification
    const toast = document.getElementById('toast-notification');

    // --- INITIALIZATION ---
    initTheme();
    checkSession();

    // --- FUNCTIONS ---

    // 1. Theme Functions
    function initTheme() {
        const savedTheme = localStorage.getItem('eco-theme');
        if (savedTheme) {
            state.theme = savedTheme;
        } else {
            // Check system preference
            const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
            state.theme = prefersDark ? 'dark' : 'light';
        }
        applyTheme();
    }

    function applyTheme() {
        document.documentElement.setAttribute('data-theme', state.theme);
        if (state.theme === 'dark') {
            darkIcon.style.display = 'block';
            lightIcon.style.display = 'none';
        } else {
            darkIcon.style.display = 'none';
            lightIcon.style.display = 'block';
        }
    }

    themeToggleBtn.addEventListener('click', () => {
        state.theme = state.theme === 'dark' ? 'light' : 'dark';
        localStorage.setItem('eco-theme', state.theme);
        applyTheme();
    });

    // 2. Auth & Session Management
    function checkSession() {
        const sessionUser = sessionStorage.getItem('eco-user');
        if (sessionUser) {
            state.isAuthenticated = true;
            state.currentUser = sessionUser;
            showView('form');
            usernameDisplay.textContent = sessionUser;
            userProfile.style.display = 'flex';
        } else {
            showView('login');
            userProfile.style.display = 'none';
        }
    }

    function showView(viewName) {
        // Remove active-view class from all
        loginView.classList.remove('active-view');
        formView.classList.remove('active-view');
        contractPreviewView.classList.remove('active-view');

        // Show selected view
        if (viewName === 'login') {
            loginView.classList.add('active-view');
        } else if (viewName === 'form') {
            formView.classList.add('active-view');
        } else if (viewName === 'preview') {
            contractPreviewView.classList.add('active-view');
        }
        // Scroll to top of the page smoothly on transition
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Toggle Password Visibility
    togglePasswordBtn.addEventListener('click', () => {
        const type = loginPassword.getAttribute('type') === 'password' ? 'text' : 'password';
        loginPassword.setAttribute('type', type);
        const icon = togglePasswordBtn.querySelector('i');
        if (type === 'text') {
            icon.classList.remove('fa-regular', 'fa-eye');
            icon.classList.add('fa-solid', 'fa-eye-slash');
        } else {
            icon.classList.remove('fa-solid', 'fa-eye-slash');
            icon.classList.add('fa-regular', 'fa-eye');
        }
    });

    // Handle Login Submit
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        const usernameVal = loginUsername.value.trim();
        const passwordVal = loginPassword.value;

        // Reset error styling
        loginUsername.closest('.input-group').classList.remove('invalid');
        loginPassword.closest('.input-group').classList.remove('invalid');
        loginFeedback.style.display = 'none';

        // Custom inline validation
        if (!usernameVal) {
            loginUsername.closest('.input-group').classList.add('invalid');
            isValid = false;
        }
        if (!passwordVal) {
            loginPassword.closest('.input-group').classList.add('invalid');
            isValid = false;
        }

        if (!isValid) return;

        // Simple hardcoded check
        if (usernameVal.toLowerCase() === 'admin' && passwordVal === 'admin123') {
            // Success
            state.isAuthenticated = true;
            state.currentUser = 'Administrateur';
            sessionStorage.setItem('eco-user', 'Administrateur');
            
            // UI Update
            usernameDisplay.textContent = 'Administrateur';
            userProfile.style.display = 'flex';
            
            // Clear inputs
            loginUsername.value = '';
            loginPassword.value = '';

            // Transition
            showView('form');
        } else {
            // Fail
            loginFeedback.style.display = 'flex';
            loginUsername.closest('.input-group').classList.add('invalid');
            loginPassword.closest('.input-group').classList.add('invalid');
        }
    });

    // Handle Logout
    logoutBtn.addEventListener('click', () => {
        state.isAuthenticated = false;
        state.currentUser = null;
        sessionStorage.removeItem('eco-user');
        userProfile.style.display = 'none';
        
        // Reset forms
        contractForm.reset();
        cdiFieldsContainer.classList.remove('expanded');
        employeePosition.removeAttribute('required');
        employeeSalary.removeAttribute('required');
        
        showView('login');
    });

    // 3. Form Logic & Dynamic Fields
    contractTypeSelect.addEventListener('change', () => {
        const type = contractTypeSelect.value;
        if (type === 'cdi') {
            cdiFieldsContainer.classList.add('expanded');
            employeePosition.setAttribute('required', 'required');
            employeeSalary.setAttribute('required', 'required');
        } else {
            cdiFieldsContainer.classList.remove('expanded');
            employeePosition.removeAttribute('required');
            employeeSalary.removeAttribute('required');
            employeePosition.value = '';
            employeeSalary.value = '';
        }
    });

    // Real-time input error removal
    contractForm.querySelectorAll('input, select').forEach(element => {
        element.addEventListener('input', () => {
            const inputGroup = element.closest('.input-group');
            if (inputGroup) {
                inputGroup.classList.remove('invalid');
            }
        });
    });

    // Form Submission
    contractForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        let isValid = true;
        const inputsToValidate = contractForm.querySelectorAll('input[required], select[required]');
        
        inputsToValidate.forEach(input => {
            const inputGroup = input.closest('.input-group');
            if (!input.value || (input.tagName === 'SELECT' && input.value === '')) {
                inputGroup.classList.add('invalid');
                isValid = false;
            } else {
                inputGroup.classList.remove('invalid');
            }
        });

        // Additional date validation
        const birthdate = new Date(document.getElementById('employee-birthdate').value);
        if (birthdate > new Date()) {
            document.getElementById('employee-birthdate').closest('.input-group').classList.add('invalid');
            isValid = false;
        }

        if (!isValid) {
            // Scroll to the first invalid field
            const firstInvalid = contractForm.querySelector('.input-group.invalid');
            if (firstInvalid) {
                firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        // Store Form Data in State
        const selectedContractType = contractTypeSelect.value;
        const selectedGender = document.querySelector('input[name="employee-gender"]:checked')?.value || 'homme';
        state.formData = {
            lastname: document.getElementById('employee-lastname').value.trim(),
            firstname: document.getElementById('employee-firstname').value.trim(),
            birthdate: document.getElementById('employee-birthdate').value,
            cin: document.getElementById('employee-cin').value.trim(),
            address: document.getElementById('employee-address').value.trim(),
            gender: selectedGender,
            contractType: selectedContractType,
            hireDate: hireDateInput.value,
            position: selectedContractType === 'cdi' ? (employeePosition.value.trim() || 'Collaborateur Technique et Administratif') : null,
            salary: selectedContractType === 'cdi' ? (employeeSalary.value ? parseFloat(employeeSalary.value).toLocaleString('fr-FR') : 'Non Spécifié') : null
        };

        // Render Preview Page
        generateContractHTML(state.formData);

        // Transition to preview
        showView('preview');
    });

    // 4. Contract Generation & Formatting Helper
    function formatDateFR(dateString) {
        if (!dateString) return '';
        const date = new Date(dateString);
        if (isNaN(date)) return dateString;
        return date.toLocaleDateString('fr-FR', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        });
    }

    function addMonths(dateString, months) {
        const date = new Date(dateString);
        if (isNaN(date)) return null;
        date.setMonth(date.getMonth() + months);
        return date.toISOString().split('T')[0];
    }

    function generateContractHTML(data) {
        const titlePrefix = data.gender === 'homme' ? 'MR' : 'MME';
        const fullName = `${titlePrefix} ${data.firstname.toUpperCase()} ${data.lastname.toUpperCase()}`;
        const birthDateFormatted = formatDateFR(data.birthdate);
        const hireDateFormatted = formatDateFR(data.hireDate);
        
        // Update Sidebar Summary
        summaryFullname.textContent = `${data.firstname} ${data.lastname}`;
        summaryType.textContent = data.contractType.toUpperCase();
        summaryDate.textContent = hireDateFormatted;

        if (data.contractType === 'cdi') {
            const template = `
                <div class="contract-title-container" style="border: 3px double #000; padding: 1.5rem; text-align: center; max-width: 500px; margin: 0 auto 2.5rem auto;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-style: italic; font-size: 16pt; font-weight: bold; letter-spacing: 1px; line-height: 1.3;">
                        CONTRAT DE TRAVAIL<br>A DUREE INDETERMINEE
                    </div>
                </div>
                
                <div class="contract-parties" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 1rem;">Entre les soussignés :</p>
                    <ul style="list-style-type: disc; margin-left: 1.5rem; padding-left: 0; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem;">
                        <li style="text-align: justify;">
                            La société « <strong>ECO TRANSFO</strong> » -S.A.R.L. au capital de. 200 000.00 DH, dont le siège social est situé à 42 Rue de la Pyramide Etage 2. App n° 17. Belvédère. Casablanca immatriculée au registre du commerce de Casablanca sous n° 285309, dûment représentée par son gérante Mme RITA BENJDYA, ayant tous pouvoirs à l'effet des présentes.
                        </li>
                        <li style="text-align: justify;">
                            <strong>${fullName}</strong> de nationalité marocaine, né le <strong>${birthDateFormatted}</strong> titulaire de la C.I.N <strong>${data.cin}</strong>, demeurant à <strong>${data.address}</strong>.
                        </li>
                    </ul>
                    <p style="margin-top: 1rem; margin-bottom: 1rem;">Il a été convenu et arrêté ce qui suit :</p>
                </div>
                <!-- ARTICLE 1 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE PREMIER : Engagement</h4>
                    <p><strong>${fullName}</strong>, est engagé en qualité d'opérateur, Il déclare être libre de tout engagement vis-à-vis de son ancien employeur, toute fausse déclaration à ce sujet étant de nature à mettre en cause sa responsabilité.</p>
                    <p style="margin-top: 0.5rem;">Le présent contrat est régi par les dispositions du code du travail, dont <strong>${fullName}</strong>, déclare avoir pris connaissance, ainsi que, par les dispositions légales et réglementaires en vigueur.</p>
                </div>

                <!-- ARTICLE 2 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE DEUXIEME : Durée du contrat</h4>
                    <p>Le présent contrat est conclu pour une durée indéterminée qui commencera le <strong>${hireDateFormatted}</strong>.</p>
                    <p>Il ne deviendra définitif qu'à l'issue d'une période d'essai de 6 mois.</p>
                    <p>Pendant cette période, chacune des parties pourra, à tout moment, mettre fin au présent contrat, sans qu'aucune indemnité ni préavis ne soit dus.</p>
                </div>

                <!-- ARTICLE 3 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE TROISIEME : Fonctions et attributions</h4>
                    <p><strong>${fullName}</strong> est engagé en qualité d'opérateur, il s'engage à prendre toutes les dispositions nécessaires pour mener à bien les fonctions qui lui sont confiées.</p>
                    <p>Les fonctions confiées à <strong>${fullName}</strong>, sont, par nature, évolutives et pourront être modifiées en fonction des nécessités de fonctionnement de l'entreprise. Il déclare accepter par avance expressément tout changement de fonction.</p>
                </div>

                <!-- ARTICLE 4 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE QUATRIEME : Durée du travail</h4>
                    <p><strong>${fullName}</strong>, travaillera 44 heures par semaine.</p>
                    <p>Les horaires pourront toutefois être modifiés à tout moment, Ce que <strong>${fullName}</strong>, déclare accepter par avance expressément.</p>
                </div>

                <!-- ARTICLE 5 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE CINQUIEME : Lieu de travail</h4>
                    <p><strong>${fullName}</strong>, Exercera ses fonctions à l'usine de la société Eco Transfo sise à Had Soualem Il s'engage expressément à accepter tout déplacement entrant dans le cadre de ses fonctions. Le lieu de travail peut être mener à changer en permanence ce que <strong>EL MASBAHI FATNA</strong> déclare accepter par avance expressément.</p>
                </div>

                <!-- ARTICLE 6 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE SIXIEME : Règlement Interne</h4>
                    <p><strong>${fullName}</strong> déclare avoir pris connaissance du règlement interne et s'engage à respecter toutes les règles de fonctionnement émanant de la Direction.</p>
                </div>

                <!-- ARTICLE 7 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE SEPTIEME : Absences</h4>
                    <p>En cas d'empêchement à remplir ses fonctions, quelle qu'en soit la cause, <strong>${fullName}</strong> s'engage à informer la direction et à justifier de son absence dans les 24 heures, sauf circonstances exceptionnelles.</p>
                </div>

                <!-- ARTICLE 8 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE HUITIEME : Exclusivité - Discrétion</h4>
                    <p style="margin-bottom: 0.5rem;"><strong>${fullName}</strong>, s'engage à travailler exclusivement pour le compte de la société « ECO TRANSFO » -S.A.R.L. et à y consacrer tout son temps.</p>
                    <p style="margin-bottom: 0.5rem;">Pendant la durée du présent contrat, <strong>${fullName}</strong>, s'interdit de s'intéresser directement ou indirectement de quelque manière et à quelque titre que ce soit, à toute autre affaire, et ce, sur l'ensemble de sa zone d'activité.</p>
                    <p style="margin-bottom: 0.5rem;"><strong>${fullName}</strong> devra se considérer comme lié par une obligation de discrétion absolue en ce qui concerne toutes les informations, ainsi que, tous renseignements confidentiels dont il pourrait avoir connaissance.</p>
                    <p style="margin-bottom: 0.5rem;">Tout manquement à cette obligation au cours du contrat constituerait une faute grave pouvant justifier un licenciement.</p>
                    <p>Cette clause de discrétion devra également être respectée par <strong>${fullName}</strong> après la rupture du présent contrat.</p>
                </div>

                <!-- ARTICLE 9 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE NEUVIEME : Congés payés</h4>
                    <p style="margin-bottom: 0.5rem;"><strong>${fullName}</strong> bénéficiera des congés payés selon la législation en vigueur.</p>
                    <p>La période de prise de congés payés sera fixée chaque année par l'employeur en tenant compte des nécessités du service et de la nature de l'activité de la société.</p>
                </div>

                <!-- ARTICLE 10 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE DIXIEME : Rupture du contrat</h4>
                    <p>Le présent contrat pourra être rompu par chacune des parties, à tout moment, sauf à respecter les obligations légales et conventionnelles en vigueur.</p>
                </div>

                <!-- ARTICLE 11 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE ONZE : Clause de non-concurrence</h4>
                    <p style="text-align: justify;"><strong>${fullName}</strong> s'engage, à compter de la cessation effective du présent contrat, quel qu'en soit le motif, à s'abstenir de toute activité concurrente dans les conditions ci-après. Pendant la durée d'application de la présente clause, le Salarié s'interdit, directement ou indirectement, pour son compte ou pour le compte de tiers, y compris par personne interposée ou au travers de toute entité : (i) d'exercer, de créer, de conseiller, d'administrer, de financer ou de détenir des intérêts (participations, titres, droits, options ou intérêts économiques de toute nature) dans toute activité se rapportant de quelque manière que ce soit aux activités d'ECO TRANSFO ; (ii) d'entrer au service, à quelque titre que ce soit (salariat, mandat social, prestation indépendante, sous-traitance, courtage, représentation, etc.) d'une entreprise exerçant tout ou partie d'activités se rapportant, de quelque manière que ce soit, aux activités d'ECO TRANSFO ; (iii) de démarcher, détourner ou tenter de détourner la clientèle d'ECO TRANSFO en vue de proposer des produits ou services concurrents. L'interdiction ci-dessus s'applique sur l'ensemble des territoires dans lesquels ECO TRANSFO est opérationnel (ou en cours de mise en place de contrats) et pendant une durée de cinq (5) ans à compter de la rupture du contrat. En cas de violation de la présente clause <strong>${fullName}</strong> sera redevable, sans mise en demeure préalable, d'une pénalité égale au manque à gagner causé par sa violation. La présente clause est indépendante des engagements de confidentialité et de non-sollicitation des clients et/ou des salariés de l'Employeur stipulés par ailleurs, lesquels demeurent applicables selon leurs propres termes.</p>
                </div>

                <!-- ARTICLE 12 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE DOUZIEME : Rémunération</h4>
                    <p style="margin-bottom: 0.3rem;">En contrepartie de ses fonctions, le salarié percevra un salaire net mensuel de <strong>${data.salary || '6500'}DH</strong>.</p>
                    <p style="margin-bottom: 0.3rem;">Ce salaire pourra être complété par une part variable selon les objectifs fixés par la direction.</p>
                    <p>Le salaire sera versé mensuellement.</p>
                </div>

                <!-- Signature Date -->
                <div style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin-bottom: 2rem;">
                    Fait à Had Soualem le, <strong>${hireDateFormatted}</strong>.
                </div>

                <!-- Signatures Bottom Section exact space -->
                <div class="contract-signatures" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; display: flex; justify-content: space-between; margin-top: 4rem; min-height: 120px; align-items: flex-start;">
                    <div style="width: 50%; text-align: left; display: flex; flex-direction: column; gap: 5rem;">
                <span>La société « ECO TRANSFO » -S.A.R.L.</span>
                    </div>
                    <div style="width: 50%; text-align: right; display: flex; flex-direction: column; gap: 5rem; font-weight: bold;">
                <span><strong>${fullName}</strong></span>
                    </div>
                </div>
            `;
            contractPaperContent.innerHTML = template;
        } else {
            const endDateFormatted = formatDateFR(addMonths(data.hireDate, 3));
            const template = `
                <div class="contract-title-container" style="border: 3px double #000; padding: 1.5rem; text-align: center; max-width: 500px; margin: 0 auto 2.5rem auto;">
                    <div style="font-family: 'Times New Roman', Times, serif; font-style: italic; font-size: 16pt; font-weight: bold; letter-spacing: 1px; line-height: 1.3;">
                        CONTRAT DE TRAVAIL<br>A DUREE DETERMINEE
                    </div>
                </div>
                <!-- Les Parties -->
                <div class="contract-parties" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.5rem;">
                    <p style="margin-bottom: 1rem;">Entre les soussignés :</p>
                    <ul style="list-style-type: disc; margin-left: 1.5rem; padding-left: 0; display: flex; flex-direction: column; gap: 1rem; margin-bottom: 1rem;">
                        <li style="text-align: justify;">
                            La société « <strong>ECO TRANSFO</strong> » -S.A.R.L. au capital de. 200 000.00 DH, dont le siège social est situé à 42 Rue de la Pyramide Etage 2. App n° 17. Belvédère. Casablanca immatriculée au registre du commerce de Casablanca sous n° 285309, dûment représentée par son gérante Mme RITA BENJDYA, ayant tous pouvoirs à l'effet des présentes.
                            <div style="text-align: right; font-style: italic; font-weight: bold; margin-top: 0.3rem;">D'une part,</div>
                        </li>
                        <li style="text-align: justify;">
                            <strong>${fullName}</strong> de nationalité marocaine, né le <strong>${birthDateFormatted}</strong> titulaire de la C.I.N <strong>${data.cin}</strong> demeurant à <strong>${data.address}</strong>.
                            <div style="text-align: right; font-style: italic; font-weight: bold; margin-top: 0.3rem;">D'autre part,</div>
                        </li>
                    </ul>
                    <p style="margin-top: 1rem; margin-bottom: 1rem;">Il a été convenu et arrêté ce qui suit :</p>
                </div>
                <!-- ARTICLE 1 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE PREMIER : Durée du contrat</h4>
                    <p>Le présent contrat est conclu pour une durée déterminée commencera <strong>${hireDateFormatted}</strong> prendra fin le <strong>${endDateFormatted}</strong> , Pendant cette période, chacune des parties pourra, à tout moment, mettre fin au présent contrat, sans qu'aucune indemnité ni préavis ne soit dus.</p>
                </div>
                <!-- ARTICLE 2  -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE DEUXIEME : Durée du travail</h4>
                    <p><strong>${fullName}</strong> travaillera 44 heures par semaine. Les horaires pourront toutefois être modifiés en raison des nécessités de service, ce que <strong>${fullName}</strong> déclare accepter par avance expressément.</p>
                </div>
                <!-- ARTICLE 3 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE TROISIEME : Lieu de travail</h4>
                    <p><strong>${fullName}</strong>, exercera ses fonctions à L'usine de la société sis à Had Soualem s'engage expressément à accepter tout déplacement ponctuel entrant dans le cadre de ses fonctions.</p>
                </div>
                <!-- ARTICLE 4 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE QUATRIEME : Absences</h4>
                    <p>En cas d'empêchement à remplir ses fonctions, quelle qu'en soit la cause <strong>${fullName}</strong> s'engage à informer son responsable hiérarchique et à justifier de son absence dans les 24 heures, sauf circonstances exceptionnelles.</p>
                </div>
                <!-- ARTICLE 5 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE CINQUIEME : Exclusivité - Discrétion</h4>
                    <p style="margin-bottom: 0.5rem;"><strong>${fullName}</strong>, s'engage à travailler exclusivement pour le compte de la société « ECO TRANSFO » -S.A.R.L., et à y consacrer tout son temps.</p>
                    <p style="margin-bottom: 0.5rem;">Pendant la durée du présent contrat <strong>${fullName}</strong>, s'interdit de s'intéresser directement ou indirectement de quelque manière et à quelque titre que ce soit, à toute affaire susceptible de concurrencer par son activité celle de l'employeur, et ce, sur l'ensemble de sa zone d'activité.</p>
                    <p style="margin-bottom: 0.5rem;"><strong>${fullName}</strong> devra se considérer comme lié par une obligation de discrétion absolue en ce qui concerne toutes les informations dont la divulgation serait de nature à favoriser les intérêts d'entreprises concurrentes de la société « ECO TRANSFO » -S.A.R.L., ainsi que, tous renseignements confidentiels dont il pourrait avoir connaissance.</p>
                    <p style="margin-bottom: 0.5rem;">Tout manquement à cette obligation au cours du contrat constituerait une faute grave pouvant justifier un licenciement.</p>
                    <p>Cette clause de discrétion devra également être respectée par <strong>${fullName}</strong>, après la rupture du présent contrat.</p>
                </div>
                <!-- ARTICLE 6 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 1.2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE SIXIEME : Congés payés</h4>
                    <p style="margin-bottom: 0.5rem;"><strong>${fullName}</strong>, bénéficiera des congés payés selon la législation en vigueur.</p>
                    <p>La période de prise de congés payés sera fixée chaque année par l'employeur en tenant compte des nécessités du service et de la nature de l'activité de la société.</p>
                </div>

                <!-- ARTICLE 7 -->
                <div class="contract-article" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; margin-bottom: 2rem;">
                    <h4 style="text-decoration: underline; font-style: italic; font-weight: bold; font-size: 11pt; margin-bottom: 0.3rem; text-transform: uppercase;">ARTICLE SEPTIEME : Rupture du contrat</h4>
                    <p>Le présent contrat pourra être rompu par chacune des parties, à tout moment, sauf à respecter les obligations légales et conventionnelles en vigueur.</p>
                </div>
                <!-- Signature Date -->
                <div style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin-bottom: 2rem;">
                    Fait à Had Soualem le, <strong>${hireDateFormatted}</strong>
                </div>
                <!-- Signatures Bottom Section -->
                <div class="contract-signatures" style="font-family: 'Times New Roman', Times, serif; font-size: 11pt; display: flex; justify-content: space-between; margin-top: 1rem; align-items: flex-start;">
                    <div style="width: 45%; text-align: left;">
                        <span>La société « ECO TRANSFO » -S.A.R.L.</span>

                    </div>
                    <div style="width: 45%; text-align: right; font-weight: bold;">
                        <span><strong>${fullName}</strong></span>

                    </div>
                </div>
            `;
            contractPaperContent.innerHTML = template;
        }
    }

    // 5. Back and Download actions
    backToFormBtn.addEventListener('click', () => {
        showView('form');
    });

    downloadPdfBtn.addEventListener('click', () => {
        const element = contractPaperContent;
        const typeLabel = state.formData.contractType.toUpperCase();
        const nameClean = state.formData.lastname.replace(/\s+/g, '_');
        const firstnameClean = state.formData.firstname.replace(/\s+/g, '_');
        const filename = `Contrat_${typeLabel}_${nameClean}_${firstnameClean}.pdf`;

        // Styling adjustment specifically for pdf generation to prevent shadows/borders
        const opt = {
            margin:       [15, 15, 15, 15], // mm margins
            filename:     filename,
            image:        { type: 'jpeg', quality: 0.98 },
            html2canvas:  { scale: 2.5, useCORS: true, letterRendering: true },
            jsPDF:        { unit: 'mm', format: 'a4', orientation: 'portrait' }
        };

        // Disable download button temporarily to prevent double click
        downloadPdfBtn.disabled = true;
        downloadPdfBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Génération...';

        html2pdf().from(element).set(opt).save()
            .then(() => {
                // Restore button
                downloadPdfBtn.disabled = false;
                downloadPdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Télécharger le PDF';
                
                // Show Success Toast
                showToast();
            })
            .catch(err => {
                console.error('Erreur de génération PDF:', err);
                downloadPdfBtn.disabled = false;
                downloadPdfBtn.innerHTML = '<i class="fa-solid fa-file-pdf"></i> Réessayer';
            });
    });

    function showToast() {
        toast.classList.add('show');
        setTimeout(() => {
            toast.classList.remove('show');
        }, 4000);
    }
});
