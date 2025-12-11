// Stan aplikacji
let petProfile = null; // null dopóki użytkownik nie doda profilu
let detectedSpeciesFromScan = null; // np. "pies" po skanowaniu dokumentu
let selectedPhotoSource = null; // "camera" | "gallery" | null
let selectedPhotoAnalyzed = false;
let vaccinations = []; // tablica obiektów: { name, type, date, nextDate }
let reminders = []; // tablica obiektów: { kind, title, date, time }

// Inicjalizacja po załadowaniu strony
document.addEventListener('DOMContentLoaded', function() {
    // Pobranie elementów DOM
    const petCard = document.getElementById('petCard');
    const openPetCardButton = document.getElementById('openPetCardButton');
    const closePetCardButton = document.getElementById('closePetCardButton');

    const petCardMainView = document.getElementById('petCardMainView');
    const vaccinationHistoryView = document.getElementById('vaccinationHistoryView');
    const profileFormView = document.getElementById('profileFormView');
    const photoFlowView = document.getElementById('photoFlowView');
    const vaccinationFormView = document.getElementById('vaccinationFormView');
    const reminderFormView = document.getElementById('reminderFormView');
    const scanView = document.getElementById('scanView');

    const petProfileEmptyState = document.getElementById('petProfileEmptyState');
    const petProfileSection = document.getElementById('petProfileSection');
    const nextVaccinationSection = document.getElementById('nextVaccinationSection');
    const remindersSection = document.getElementById('remindersSection');

    const petCardSubtitle = document.getElementById('petCardSubtitle');

    // Profil – display:
    const petNameDisplay = document.getElementById('petNameDisplay');
    const petSpeciesTag = document.getElementById('petSpeciesTag');
    const petBreedDisplay = document.getElementById('petBreedDisplay');
    const petColorDisplay = document.getElementById('petColorDisplay');
    const petSexDisplay = document.getElementById('petSexDisplay');
    const petWeightDisplay = document.getElementById('petWeightDisplay');
    const petAgeDisplay = document.getElementById('petAgeDisplay');
    const petAvatar = document.getElementById('petAvatar');

    // Profil – formularz:
    const profileForm = document.getElementById('profileForm');
    const profileFormTitle = document.getElementById('profileFormTitle');
    const profileNameInput = document.getElementById('profileNameInput');
    const profileSpeciesInput = document.getElementById('profileSpeciesInput');
    const profileBreedInput = document.getElementById('profileBreedInput');
    const profileColorInput = document.getElementById('profileColorInput');
    const profileSexInput = document.getElementById('profileSexInput');
    const profileWeightInput = document.getElementById('profileWeightInput');
    const profileAgeInput = document.getElementById('profileAgeInput');
    const profileFormAvatarPreview = document.getElementById('profileFormAvatarPreview');
    const changeAvatarButton = document.getElementById('changeAvatarButton');

    // Przyciski profilowe:
    const addPetProfileButton = document.getElementById('addPetProfileButton');
    const takePetPhotoButton = document.getElementById('takePetPhotoButton');
    const editProfileButton = document.getElementById('editProfileButton');
    
    // Photo flow:
    const simulateCameraShotButton = document.getElementById('simulateCameraShotButton');
    const simulateGalleryPickButton = document.getElementById('simulateGalleryPickButton');
    const startAiAnalysisButton = document.getElementById('startAiAnalysisButton');
    const photoPreviewText = document.getElementById('photoPreviewText');
    const photoAiStatusText = document.getElementById('photoAiStatusText');
    const photoPreviewImage = document.getElementById('photoPreviewImage');
    const photoPreviewPlaceholder = document.getElementById('photoPreviewPlaceholder');
    const photoPreviewMetaText = document.getElementById('photoPreviewMetaText');

    // Historia szczepień:
    const openVaccinationHistoryButton = document.getElementById('openVaccinationHistoryButton');
    const vaccinationList = document.getElementById('vaccinationList');
    const addVaccinationButton = document.getElementById('addVaccinationButton');
    const scanVaccinationButton = document.getElementById('scanVaccinationButton');
    const vaccinationForm = document.getElementById('vaccinationForm');
    const vaccineNameInput = document.getElementById('vaccineNameInput');
    const vaccineTypeInput = document.getElementById('vaccineTypeInput');
    const vaccineDateInput = document.getElementById('vaccineDateInput');
    const vaccineNextDateInput = document.getElementById('vaccineNextDateInput');
    const nextVaccinationSummary = document.getElementById('nextVaccinationSummary');

    // Przypomnienia:
    const remindersList = document.getElementById('remindersList');
    const addReminderButton = document.getElementById('addReminderButton');
    const scanReminderFromVaccinationButton = document.getElementById('scanReminderFromVaccinationButton');
    const reminderForm = document.getElementById('reminderForm');
    const reminderKindInput = document.getElementById('reminderKindInput');
    const reminderTitleInput = document.getElementById('reminderTitleInput');
    const reminderDateInput = document.getElementById('reminderDateInput');
    const reminderTimeInput = document.getElementById('reminderTimeInput');

    // Skan:
    const simulateScanButton = document.getElementById('simulateScanButton');

    const actionButtons = document.querySelectorAll('.action-button');

    // Funkcje pomocnicze
    function showPetCard() {
        petCard.classList.remove('hidden');
        petCard.classList.add('open');
        openPetCardButton.classList.add('active');
    }

    function hidePetCard() {
        petCard.classList.remove('open');
        petCard.classList.add('hidden');
        openPetCardButton.classList.remove('active');
        showView('petCardMainView');
    }

    function showView(viewId) {
        // Ukryj wszystkie widoki
        const allViews = document.querySelectorAll('.pet-card-content');
        allViews.forEach(view => {
            view.classList.add('hidden');
        });

        // Pokaż wybrany widok
        const targetView = document.getElementById(viewId);
        if (targetView) {
            targetView.classList.remove('hidden');
        }
    }

    function renderProfileState() {
        if (petProfile === null) {
            // Pusty stan
            petProfileEmptyState.classList.remove('hidden');
            petProfileSection.classList.add('hidden');
            nextVaccinationSection.classList.add('hidden');
            remindersSection.classList.add('hidden');
            petCardSubtitle.textContent = 'Brak danych zwierzaka';
        } else {
            // Wypełniony profil
            petProfileEmptyState.classList.add('hidden');
            petProfileSection.classList.remove('hidden');
            nextVaccinationSection.classList.remove('hidden');
            remindersSection.classList.remove('hidden');

            // Wypełnij dane
            petNameDisplay.textContent = petProfile.name;
            petSpeciesTag.textContent = petProfile.species === 'pies' ? 'Pies' : 'Kot';
            petBreedDisplay.textContent = petProfile.breed || '-';
            petColorDisplay.textContent = petProfile.color || '-';
            petSexDisplay.textContent = petProfile.sex === 'samica' ? 'Samica' : 'Samiec';
            petWeightDisplay.textContent = petProfile.weight ? `${petProfile.weight} kg` : '-';
            petAgeDisplay.textContent = petProfile.age ? `${petProfile.age} lat` : '-';

            // Ustaw avatar
            petAvatar.textContent = petProfile.species === 'pies' ? '🐶' : '🐱';

            // Ustaw podtytuł
            petCardSubtitle.textContent = `Profil: ${petProfile.name} (${petSpeciesTag.textContent})`;
        }
    }

    function formatDate(dateString) {
        const date = new Date(dateString);
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}.${month}.${year}`;
    }

    function renderVaccinations() {
        vaccinationList.innerHTML = '';

        if (vaccinations.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Brak wpisów szczepień.';
            emptyMsg.style.color = '#757575';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.padding = '24px';
            vaccinationList.appendChild(emptyMsg);
            return;
        }

        vaccinations.forEach(vaccination => {
            const typeMap = {
                'wscieklizna': 'wścieklizna',
                'kombinowane': 'Kombinowane',
                'inne': 'Inne'
            };
            const typeLabel = typeMap[vaccination.type] || vaccination.type;

            const article = document.createElement('article');
            article.className = 'vaccination-item';
            article.innerHTML = `
                <h4>${vaccination.name}</h4>
                <p class="vaccination-subtitle">${vaccination.name} · Typ: ${typeLabel}</p>
                <div class="vaccination-meta">
                    <p>Wykonano: <strong>${formatDate(vaccination.date)}</strong></p>
                    <p>Następne: <strong>${formatDate(vaccination.nextDate)}</strong></p>
                    <span class="status-chip status-active">Aktywne</span>
                </div>
            `;
            vaccinationList.appendChild(article);
        });
    }

    function updateNextVaccinationSummary() {
        if (vaccinations.length === 0) {
            nextVaccinationSummary.innerHTML = '<p>Brak zaplanowanych szczepień.</p>';
            return;
        }

        // Znajdź najbliższe szczepienie (najmniejsza data nextDate)
        const now = new Date();
        const upcomingVaccinations = vaccinations
            .map(v => ({ ...v, nextDateObj: new Date(v.nextDate) }))
            .filter(v => v.nextDateObj > now)
            .sort((a, b) => a.nextDateObj - b.nextDateObj);

        if (upcomingVaccinations.length === 0) {
            nextVaccinationSummary.innerHTML = '<p>Brak zaplanowanych szczepień.</p>';
            return;
        }

        const next = upcomingVaccinations[0];
        const typeMap = {
            'wscieklizna': 'wścieklizna',
            'kombinowane': 'Kombinowane',
            'inne': 'Inne'
        };
        const typeLabel = typeMap[next.type] || next.type;

        nextVaccinationSummary.innerHTML = `
            <div class="next-vaccination-item">
                <h4>${next.name}</h4>
                <p>Typ: ${typeLabel}</p>
                <p>Następna dawka: <strong>${formatDate(next.nextDate)}</strong></p>
            </div>
        `;
    }

    function renderReminders() {
        remindersList.innerHTML = '';

        if (reminders.length === 0) {
            const emptyMsg = document.createElement('p');
            emptyMsg.textContent = 'Brak przypomnień.';
            emptyMsg.style.color = '#757575';
            emptyMsg.style.textAlign = 'center';
            emptyMsg.style.padding = '24px';
            remindersList.appendChild(emptyMsg);
            return;
        }

        reminders.forEach(reminder => {
            const kindMap = {
                'zwykle': 'Zwykłe',
                'szczepienie': 'O szczepieniu',
                'wizyta': 'O wizycie u weterynarza'
            };
            const kindLabel = kindMap[reminder.kind] || reminder.kind;

            const article = document.createElement('article');
            article.className = 'reminder-item';
            article.innerHTML = `
                <h4>${reminder.title}</h4>
                <p class="reminder-subtitle">${kindLabel} – ${formatDate(reminder.date)}, ${reminder.time}</p>
                <span class="reminder-kind-label">Typ: ${reminder.kind}</span>
            `;
            remindersList.appendChild(article);
        });
    }

    // Zdarzenia – logika UI

    // Otwieranie / zamykanie karty zwierzaka
    openPetCardButton.addEventListener('click', function() {
        console.log('Kliknięto: Karta zwierzaka');
        showPetCard();
        showView('petCardMainView');
        renderProfileState();
        renderVaccinations();
        updateNextVaccinationSummary();
        renderReminders();
    });

    closePetCardButton.addEventListener('click', function() {
        hidePetCard();
        console.log('Zamknięto panel Karta zwierzaka');
    });

    // Kliknięcia w dolnym .action-bar
    actionButtons.forEach(function(button) {
        button.addEventListener('click', function() {
            const label = this.querySelector('.action-label').textContent;
            console.log('Kliknięto przycisk dolnego paska:', label);
        });
    });

    // Dodawanie / edycja profilu
    if (addPetProfileButton) {
        addPetProfileButton.addEventListener('click', function() {
            console.log("Kliknięto: Uzupełnij dane zwierzaka ręcznie");
            profileFormTitle.textContent = "Uzupełnij dane zwierzaka";
            
            // czyścimy formularz
            profileForm.reset();
            
            // Domyślnie przyjmijmy, że to pies (użytkownik może zmienić)
            profileSpeciesInput.value = "pies";
            profileSexInput.value = "samica";
            profileFormAvatarPreview.textContent =
                profileSpeciesInput.value === "kot" ? "🐱" : "🐶";
            
            showView("profileFormView");
        });
    }

    if (takePetPhotoButton) {
        takePetPhotoButton.addEventListener('click', function() {
            console.log("Kliknięto: Zrób zdjęcie zwierzaka (wejście w flow)");
            selectedPhotoSource = null;
            selectedPhotoAnalyzed = false;
            
            // Reset podglądu
            if (photoPreviewImage) {
                photoPreviewImage.src = "";
                photoPreviewImage.classList.add("hidden");
            }
            if (photoPreviewPlaceholder) {
                photoPreviewPlaceholder.classList.remove("hidden");
            }
            if (photoPreviewText) {
                photoPreviewText.textContent = "Nie wybrano jeszcze zdjęcia.";
            }
            if (photoPreviewMetaText) {
                photoPreviewMetaText.textContent = "Źródło zdjęcia: brak";
            }
            if (photoAiStatusText) {
                photoAiStatusText.textContent = "Po wybraniu zdjęcia uruchom analizę AI.";
            }
            if (startAiAnalysisButton) {
                startAiAnalysisButton.disabled = true;
                startAiAnalysisButton.textContent = "Analizuj zdjęcie (AI)";
            }
            showView("photoFlowView");
        });
    }

    if (simulateCameraShotButton) {
        simulateCameraShotButton.addEventListener('click', function() {
            console.log("Symulacja: zrobienie zdjęcia aparatem");
            selectedPhotoSource = "camera";
            selectedPhotoAnalyzed = false;
            
            if (photoPreviewImage) {
                photoPreviewImage.src = "assets/dog-camera.jpg";
                photoPreviewImage.classList.remove("hidden");
            }
            if (photoPreviewPlaceholder) {
                photoPreviewPlaceholder.classList.add("hidden");
            }
            if (photoPreviewText) {
                photoPreviewText.textContent = "Symulowane zdjęcie wykonane aparatem.";
            }
            if (photoPreviewMetaText) {
                photoPreviewMetaText.textContent = "Źródło zdjęcia: aparat (symulacja).";
            }
            if (photoAiStatusText) {
                photoAiStatusText.textContent = "Zdjęcie gotowe. Możesz uruchomić analizę AI.";
            }
            if (startAiAnalysisButton) {
                startAiAnalysisButton.disabled = false;
            }
        });
    }

    if (simulateGalleryPickButton) {
        simulateGalleryPickButton.addEventListener('click', function() {
            console.log("Symulacja: wybór zdjęcia z galerii");
            selectedPhotoSource = "gallery";
            selectedPhotoAnalyzed = false;
            
            if (photoPreviewImage) {
                photoPreviewImage.src = "assets/dog-gallery.jpg";
                photoPreviewImage.classList.remove("hidden");
            }
            if (photoPreviewPlaceholder) {
                photoPreviewPlaceholder.classList.add("hidden");
            }
            if (photoPreviewText) {
                photoPreviewText.textContent = "Symulowane zdjęcie wybrane z galerii.";
            }
            if (photoPreviewMetaText) {
                photoPreviewMetaText.textContent = "Źródło zdjęcia: galeria (symulacja).";
            }
            if (photoAiStatusText) {
                photoAiStatusText.textContent = "Zdjęcie gotowe. Możesz uruchomić analizę AI.";
            }
            if (startAiAnalysisButton) {
                startAiAnalysisButton.disabled = false;
            }
        });
    }

    if (startAiAnalysisButton) {
        startAiAnalysisButton.addEventListener('click', function() {
            if (!selectedPhotoSource) {
                return;
            }
            
            console.log("Rozpoczynam analizę zdjęcia (AI). Źródło:", selectedPhotoSource);
            startAiAnalysisButton.disabled = true;
            startAiAnalysisButton.textContent = "Analizuję...";
            
            if (photoAiStatusText) {
                photoAiStatusText.textContent = "Analizujemy umaszczenie i rasę zwierzaka na podstawie zdjęcia...";
            }
            
            // Symulacja czasu analizy AI
            setTimeout(() => {
                // Symulowany wynik AI – dla prototypu twardo wpisujemy owczarka niemieckiego
                const aiResult = {
                    breed: "Owczarek niemiecki",
                    color: "Czarny podpalany"
                };
                
                selectedPhotoAnalyzed = true;
                console.log("Wynik analizy AI:", aiResult);
                
                if (photoAiStatusText) {
                    photoAiStatusText.textContent =
                        "Analiza zakończona. Uzupełniono pola rasa i kolor – sprawdź i uzupełnij pozostałe dane.";
                }
                
                startAiAnalysisButton.disabled = false;
                startAiAnalysisButton.textContent = "Analizuj zdjęcie (AI)";
                
                // Przygotowanie formularza profilu
                profileFormTitle.textContent = "Uzupełnij dane zwierzaka";
                
                // Imię zostawiamy puste – użytkownik sam je poda
                profileNameInput.value = "";
                
                // Gatunek – jeśli nic nie ustawione, przyjmijmy psa
                if (!profileSpeciesInput.value) {
                    profileSpeciesInput.value = "pies";
                }
                
                // UZUPEŁNIAMY TYLKO RASĘ I KOLOR
                profileBreedInput.value = aiResult.breed;
                profileColorInput.value = aiResult.color;
                
                // Pozostałe pola puste/dom.
                if (!profileSexInput.value) {
                    profileSexInput.value = "samica";
                }
                profileWeightInput.value = "";
                profileAgeInput.value = "";
                
                // Avatar na podstawie gatunku
                profileFormAvatarPreview.textContent =
                    profileSpeciesInput.value === "kot" ? "🐱" : "🐶";
                
                // Przejście do formularza profilu
                showView("profileFormView");
            }, 1200);
        });
    }

    if (editProfileButton) {
        editProfileButton.addEventListener('click', function() {
            if (!petProfile) return;
            
            console.log("Kliknięto: Edytuj dane zwierzaka");
            profileFormTitle.textContent = "Edytuj dane zwierzaka";
            
            profileNameInput.value = petProfile.name || "";
            profileSpeciesInput.value = petProfile.species || "pies";
            profileBreedInput.value = petProfile.breed || "";
            profileColorInput.value = petProfile.color || "";
            profileSexInput.value = petProfile.sex || "samica";
            profileWeightInput.value = petProfile.weight || "";
            profileAgeInput.value = petProfile.age || "";
            
            profileFormAvatarPreview.textContent =
                petProfile.species === "kot" ? "🐱" : "🐶";
            
            showView("profileFormView");
        });
    }

    changeAvatarButton.addEventListener('click', function() {
        // Symulacja zmiany zdjęcia - przełącz emoji
        const currentAvatar = profileFormAvatarPreview.textContent;
        if (currentAvatar === '🐶') {
            profileFormAvatarPreview.textContent = '🐱';
        } else {
            profileFormAvatarPreview.textContent = '🐶';
        }
        console.log('Symulacja zmiany zdjęcia - zmieniono avatar');
    });

    profileForm.addEventListener('submit', function(e) {
        e.preventDefault();

        // Odczytaj wartości pól
        petProfile = {
            name: profileNameInput.value.trim(),
            species: profileSpeciesInput.value,
            breed: profileBreedInput.value.trim(),
            color: profileColorInput.value.trim(),
            sex: profileSexInput.value,
            weight: profileWeightInput.value.trim() ? parseFloat(profileWeightInput.value) : null,
            age: profileAgeInput.value.trim() ? parseInt(profileAgeInput.value) : null
        };

        // po zapisaniu profilu wynik AI nie jest już potrzebny
        detectedSpeciesFromScan = null;

        renderProfileState();
        showView("petCardMainView");
        console.log('Zapisano profil zwierzaka:', petProfile);
    });

    // Historia szczepień
    openVaccinationHistoryButton.addEventListener('click', function() {
        showView('vaccinationHistoryView');
        renderVaccinations();
        console.log('Otworzono historię szczepień');
    });

    addVaccinationButton.addEventListener('click', function() {
        vaccinationForm.reset();
        showView('vaccinationFormView');
        console.log('Otworzono formularz dodawania szczepienia');
    });

    vaccinationForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const vaccination = {
            name: vaccineNameInput.value,
            type: vaccineTypeInput.value,
            date: vaccineDateInput.value,
            nextDate: vaccineNextDateInput.value
        };

        vaccinations.push(vaccination);
        renderVaccinations();
        updateNextVaccinationSummary();
        showView('vaccinationHistoryView');
        console.log('Dodano szczepienie:', vaccination);
    });

    // Skanowanie dokumentu (szczepienie + auto-przypomnienie)
    scanVaccinationButton.addEventListener('click', function() {
        showView('scanView');
        console.log('Otworzono widok skanowania');
    });

    scanReminderFromVaccinationButton.addEventListener('click', function() {
        // W prototypie użyj tego samego widoku skanowania
        showView('scanView');
        console.log('Otworzono widok skanowania dla przypomnienia');
    });

    simulateScanButton.addEventListener('click', function() {
        // Symulacja wyniku OCR
        const scanned = {
            name: 'Versiguard',
            type: 'wscieklizna',
            date: '2024-08-30',
            nextDate: '2025-08-30',
            species: 'pies'
        };

        // Ustaw detectedSpeciesFromScan
        detectedSpeciesFromScan = scanned.species;

        // Wypełnij formularz szczepienia
        vaccineNameInput.value = scanned.name;
        vaccineTypeInput.value = scanned.type;
        vaccineDateInput.value = scanned.date;
        vaccineNextDateInput.value = scanned.nextDate;

        // Automatycznie dodaj szczepienie
        const vaccination = {
            name: scanned.name,
            type: scanned.type,
            date: scanned.date,
            nextDate: scanned.nextDate
        };
        vaccinations.push(vaccination);

        // Automatycznie utwórz przypomnienie 7 dni przed nextDate
        const nextDateObj = new Date(scanned.nextDate);
        const reminderDateObj = new Date(nextDateObj);
        reminderDateObj.setDate(reminderDateObj.getDate() - 7);
        
        const reminderDate = reminderDateObj.toISOString().split('T')[0];
        const reminder = {
            kind: 'szczepienie',
            title: 'Przypomnienie o szczepieniu',
            date: reminderDate,
            time: '10:00'
        };
        reminders.push(reminder);

        // Odśwież widoki
        renderVaccinations();
        updateNextVaccinationSummary();
        renderReminders();

        // Przełącz na widok historii szczepień
        showView('vaccinationHistoryView');
        console.log('Symulacja skanowania zakończona - dodano szczepienie i przypomnienie');
    });

    // Przypomnienia
    addReminderButton.addEventListener('click', function() {
        reminderForm.reset();
        reminderKindInput.value = 'zwykle'; // domyślnie
        showView('reminderFormView');
        console.log('Otworzono formularz dodawania przypomnienia');
    });

    reminderForm.addEventListener('submit', function(e) {
        e.preventDefault();

        const reminder = {
            kind: reminderKindInput.value,
            title: reminderTitleInput.value,
            date: reminderDateInput.value,
            time: reminderTimeInput.value
        };

        reminders.push(reminder);
        renderReminders();
        showView('petCardMainView');
        console.log('Dodano przypomnienie:', reminder);
    });

    // Nawigacja „powrót” w widokach wewnętrznych
    petCard.addEventListener('click', function(e) {
        const backButton = e.target.closest('[data-back-to]');
        if (backButton) {
            const targetViewId = backButton.getAttribute('data-back-to');
            showView(targetViewId);
            console.log('Powrót do widoku:', targetViewId);
        }
    });
});
