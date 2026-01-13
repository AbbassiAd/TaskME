import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Save, ArrowLeft, Upload, X, Car } from 'lucide-react';
import axios from 'axios';
import styles from './TaskForm.module.css';

const TaskForm = () => {
    const navigate = useNavigate();
    const { id } = useParams();
    const isEditMode = !!id;
    const [vehicles, setVehicles] = useState([]);
    const [loadingVehicles, setLoadingVehicles] = useState(false);
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        type: '',
        startDate: '',
        endDate: '',
        isRemunerated: false,
        vehicleNeeded: false,
        vehicleId: '', // Champ pour stocker l'ID du véhicule sélectionné
        places: 1,
        direction: '',
        file: null,
        scope: 'particuliere',
        specialties: [],
        grades: []
    });

    const [existingFile, setExistingFile] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fonction pour charger les véhicules disponibles
    const fetchVehicles = async () => {
        try {
            setLoadingVehicles(true);
            const token = localStorage.getItem('taskme_token');
            const res = await axios.get('http://localhost:5000/api/vehicles', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setVehicles(res.data);
        } catch (error) {
            console.error('Error fetching vehicles', error);
            alert('Erreur lors du chargement des véhicules: ' + error.message);
        } finally {
            setLoadingVehicles(false);
        }
    };

    useEffect(() => {
        if (isEditMode) {
            const fetchTask = async () => {
                try {
                    const res = await axios.get(`http://localhost:5000/api/tasks/${id}`, {
                        headers: { Authorization: `Bearer ${localStorage.getItem('taskme_token')}` }
                    });
                    const data = res.data;
                    setFormData({
                        title: data.name,
                        description: data.description,
                        type: data.type,
                        startDate: data.startDate ? data.startDate.split('T')[0] : '',
                        endDate: data.endDate ? data.endDate.split('T')[0] : '',
                        isRemunerated: data.isPaid,
                        vehicleNeeded: data.needsVehicle,
                        vehicleId: data.vehicleId || '', // Récupérer l'ID du véhicule si existant
                        places: data.capacity,
                        direction: data.direction || '',
                        scope: data.scope || 'particuliere',
                        specialties: data.specialties || [],
                        grades: data.grades || ['All']
                    });
                    setExistingFile(data.pdfFile);
                } catch (error) {
                    console.error('Error fetching task for edit', error);
                    alert('Erreur lors du chargement de la tâche: ' + error.message);
                }
            };
            fetchTask();
        }
    }, [id, isEditMode]);

    // Charger les véhicules si vehicleNeeded est true
    useEffect(() => {
        if (formData.vehicleNeeded) {
            fetchVehicles();
        }
    }, [formData.vehicleNeeded]);

    const handleChange = (e) => {
        const { name, value, type, checked, files } = e.target;
        
        if (type === 'file') {
            setFormData(prev => ({
                ...prev,
                file: files[0]
            }));
        } else if (type === 'checkbox') {
            // Si on décoche "vehicleNeeded", on réinitialise vehicleId
            if (name === 'vehicleNeeded' && !checked) {
                setFormData(prev => ({
                    ...prev,
                    vehicleNeeded: false,
                    vehicleId: '',
                    direction: ''
                }));
            } else {
                setFormData(prev => ({
                    ...prev,
                    [name]: checked
                }));
            }
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    // Fonction pour sélectionner un véhicule et remplir automatiquement la direction
    const handleVehicleSelect = (vehicleId) => {
        const selectedVehicle = vehicles.find(v => v._id === vehicleId);
        setFormData(prev => ({
            ...prev,
            vehicleId: vehicleId,
            // Remplir automatiquement la direction si elle n'est pas déjà définie
            direction: prev.direction || (selectedVehicle ? selectedVehicle.direction : '')
        }));
    };

    const handleSpecialtyChange = (e) => {
        const value = e.target.value;
        if (value) {
            setFormData(prev => {
                if (prev.scope === 'particuliere') {
                    return { ...prev, specialties: [value] };
                } else {
                    if (!prev.specialties.includes(value)) {
                        return { ...prev, specialties: [...prev.specialties, value] };
                    }
                    return prev;
                }
            });
        }
    };

    const removeSpecialty = (specialtyToRemove) => {
        setFormData(prev => ({
            ...prev,
            specialties: prev.specialties.filter(specialty => specialty !== specialtyToRemove)
        }));
    };

    const handleGradesChange = (e) => {
        const value = e.target.value;
        if (value === 'All') {
            setFormData(prev => ({ ...prev, grades: ['All'] }));
        } else {
            setFormData(prev => ({ ...prev, grades: [value] }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            const data = new FormData();
            
            // Ajout des champs dans FormData
            data.append('name', formData.title);
            data.append('description', formData.description);
            data.append('type', formData.type);
            data.append('startDate', formData.startDate);
            data.append('endDate', formData.endDate);
            data.append('isPaid', formData.isRemunerated.toString());
            data.append('needsVehicle', formData.vehicleNeeded.toString());
            
            // Ajouter vehicleId si vehicleNeeded est true
            if (formData.vehicleNeeded) {
                data.append('vehicleId', formData.vehicleId || '');
            } else {
                data.append('vehicleId', ''); // Vide si pas de véhicule nécessaire
            }
            
            data.append('capacity', formData.places.toString());
            data.append('direction', formData.direction || '');
            data.append('scope', formData.scope);

            // Gestion des tableaux (specialties)
            if (formData.specialties && formData.specialties.length > 0) {
                formData.specialties.forEach(specialty => {
                    data.append('specialties', specialty);
                });
            }

            // Gestion des grades
            if (formData.grades && formData.grades.length > 0) {
                if (formData.grades[0] === 'All') {
                    data.append('grades', '');
                } else {
                    formData.grades.forEach(grade => {
                        data.append('grades', grade);
                    });
                }
            }

            // Gestion du fichier
            if (formData.file) {
                data.append('pdfFile', formData.file);
            }

            const token = localStorage.getItem('taskme_token');
            const config = {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            };

            // DEBUG: Afficher le contenu du FormData
            console.log('FormData contents:');
            for (let [key, value] of data.entries()) {
                console.log(key, value);
            }

            if (isEditMode) {
                await axios.put(`http://localhost:5000/api/tasks/${id}`, data, config);
                alert('Tâche modifiée avec succès');
            } else {
                await axios.post("http://localhost:5000/api/tasks", data, config);
                alert('Tâche créée avec succès');
            }

            navigate('/tasks');
        } catch (error) {
            console.error('Error saving task:', error);
            alert('Erreur: ' + (error.response?.data?.message || error.message));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDrop = (e) => {
        e.preventDefault();
        const files = e.dataTransfer.files;
        if (files.length > 0 && files[0].type === 'application/pdf') {
            setFormData(prev => ({
                ...prev,
                file: files[0]
            }));
        }
    };

    const handleDragOver = (e) => {
        e.preventDefault();
    };

    return (
        <div className={styles.container}>
            <div className={styles.header}>
                <button 
                    onClick={() => navigate('/tasks')} 
                    className={styles.backBtn}
                    disabled={isSubmitting}
                >
                    <ArrowLeft size={20} />
                    <span>Retour</span>
                </button>
                <h1 className={styles.title}>
                    {isEditMode ? 'Modifier la Tâche' : 'Créer une nouvelle Tâche'}
                </h1>
            </div>

            <form onSubmit={handleSubmit} className={styles.form}>
                {/* Section 1: Informations Générales */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Informations Générales</h2>
                    <div className={styles.grid2}>
                        <div className={styles.field}>
                            <label>Titre de la tâche *</label>
                            <input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="Ex: Formation Pédagogique"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Type de mission *</label>
                            <select 
                                name="type" 
                                value={formData.type} 
                                onChange={handleChange} 
                                required
                                disabled={isSubmitting}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="Formateur">Formateur</option>
                                <option value="Membre de jury">Membre de jury</option>
                                <option value="Bénéficiaire de formation">Bénéficiaire de formation</option>
                                <option value="Observateur">Observateur</option>
                                <option value="Concepteur d'évaluation">Concepteur d'évaluation</option>
                            </select>
                        </div>
                    </div>

                    {/* New Scope & Specialties Section */}
                    <div className={styles.grid2} style={{ marginTop: '1rem' }}>
                        <div className={styles.field}>
                            <label>Nature de la mission</label>
                            <div className={styles.radioGroup}>
                                <label>
                                    <input
                                        type="radio"
                                        name="scope"
                                        value="particuliere"
                                        checked={formData.scope === 'particuliere'}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    /> 
                                    <span>Particulière (Une seule spécialité)</span>
                                </label><br />
                                <label>
                                    <input
                                        type="radio"
                                        name="scope"
                                        value="commune"
                                        checked={formData.scope === 'commune'}
                                        onChange={handleChange}
                                        disabled={isSubmitting}
                                    />
                                    <span>Commune (Plusieurs spécialités)</span>
                                </label>
                            </div>
                        </div>
                        <div className={styles.field}>
                            <label>Spécialités concernées *</label>
                            <select
                                name="specialtiesSelect"
                                onChange={handleSpecialtyChange}
                                value=""
                                disabled={isSubmitting || (formData.scope === 'particuliere' && formData.specialties.length > 0)}
                                className={styles.selectInput}
                            >
                                <option value="">Sélectionner...</option>
                                <option value="pedagogique">Pédagogique</option>
                                <option value="orientation">Orientation</option>
                                <option value="planification">Planification</option>
                                <option value="financier">Financier</option>
                                <option value="administration">Administration</option>
                            </select>
                            
                            {formData.specialties.length > 0 && (
                                <div className={styles.selectedItems}>
                                    {formData.specialties.map((specialty, index) => (
                                        <span key={index} className={styles.selectedTag}>
                                            {specialty}
                                            <button 
                                                type="button"
                                                onClick={() => removeSpecialty(specialty)}
                                                className={styles.removeBtn}
                                                disabled={isSubmitting}
                                            >
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                            
                            {formData.scope === 'commune' && formData.specialties.length > 0 && (
                                <button 
                                    type="button" 
                                    onClick={() => setFormData(p => ({ ...p, specialties: [] }))} 
                                    className={styles.resetBtn}
                                    disabled={isSubmitting}
                                >
                                    Réinitialiser toutes
                                </button>
                            )}
                        </div>
                    </div>

                    <div className={styles.field}>
                        <label>Description *</label>
                        <textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            rows={4}
                            required
                            disabled={isSubmitting}
                            placeholder="Décrivez les détails de la mission..."
                        />
                    </div>
                </section>

                {/* Section 2: Planification & Logistique */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Planification & Logistique</h2>
                    <div className={styles.grid2}>
                        <div className={styles.field}>
                            <label>Date de début *</label>
                            <input 
                                type="date" 
                                name="startDate" 
                                value={formData.startDate} 
                                onChange={handleChange} 
                                required 
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Date de fin *</label>
                            <input 
                                type="date" 
                                name="endDate" 
                                value={formData.endDate} 
                                onChange={handleChange} 
                                required 
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    <div className={styles.checkboxGroup}>
                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="isRemunerated"
                                checked={formData.isRemunerated}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <span className={styles.customCheck}></span>
                            Mission Rémunérée
                        </label>

                        <label className={styles.checkboxLabel}>
                            <input
                                type="checkbox"
                                name="vehicleNeeded"
                                checked={formData.vehicleNeeded}
                                onChange={handleChange}
                                disabled={isSubmitting}
                            />
                            <span className={styles.customCheck}></span>
                            Nécessite un Véhicule
                        </label>
                    </div>

                    {formData.vehicleNeeded && (
                        <>
                            <div className={styles.field}>
                                <label>Choisir un véhicule *</label>
                                {loadingVehicles ? (
                                    <p>Chargement des véhicules...</p>
                                ) : vehicles.length > 0 ? (
                                    <select
                                        name="vehicleId"
                                        value={formData.vehicleId}
                                        onChange={(e) => handleVehicleSelect(e.target.value)}
                                        required
                                        disabled={isSubmitting}
                                        className={styles.selectInput}
                                    >
                                        <option value="">Sélectionner un véhicule...</option>
                                        {vehicles.map(v => (
                                            <option key={v._id} value={v._id}>
                                                {v.brand} {v.model} | Direction: {v.direction || 'N/A'} | Places restantes: {v.nbPlaceReste}
                                            </option>
                                        ))}
                                    </select>
                                ) : (
                                    <p>Aucun véhicule disponible</p>
                                )}
                            </div>
                            
                            <div className={styles.field}>
                                <label>Direction / Ligne *</label>
                                <select 
                                    name="direction"
                                    value={formData.direction} 
                                    onChange={handleChange}
                                    required 
                                    disabled={isSubmitting}
                                    className={styles.selectInput}
                                >
                                    <option value="">Sélectionner une direction...</option>
                                    <option value="Rabat-Casa">Rabat - Casa</option>
                                    <option value="Meknès-Errachidia">Meknès - Errachidia</option>
                                    <option value="Marrakech-Agadir">Marrakech - Agadir</option>
                                    <option value="Tanger-Tétouan">Tanger - Tétouan</option>
                                    <option value="Fès-Oujda">Fès - Oujda</option>
                                    <option value="Safi-Essaouira">Safi - Essaouira</option>
                                </select>
                                <p className={styles.helperText}>
                                    Sélectionnez manuellement la direction/ligne pour cette mission
                                </p>
                            </div>
                        </>
                    )}
                </section>

                {/* Section 3: Population Cible */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Ciblage</h2>
                    <div className={styles.grid2}>
                        <div className={styles.field}>
                            <label>Nombre de places *</label>
                            <input
                                type="number"
                                name="places"
                                value={formData.places}
                                onChange={handleChange}
                                min="1"
                                max="100"
                                required
                                disabled={isSubmitting}
                            />
                        </div>
                        <div className={styles.field}>
                            <label>Grades Concernés</label>
                            <select 
                                name="grades" 
                                value={formData.grades[0] || 'All'} 
                                onChange={handleGradesChange}
                                disabled={isSubmitting}
                                className={styles.selectInput}
                            >
                                <option value="All">Tous les grades</option>
                                <option value="A">Grade A uniquement</option>
                                <option value="B">Grade B uniquement</option>
                                <option value="C">Grade C uniquement</option>
                                <option value="D">Grade D uniquement</option>
                            </select>
                        </div>
                    </div>
                </section>

                {/* Section 4: Documents */}
                <section className={styles.section}>
                    <h2 className={styles.sectionTitle}>Documents Joints</h2>
                    
                    {existingFile && !formData.file && (
                        <div className={styles.existingFile}>
                            <p><strong>Fichier actuel :</strong> {existingFile.split('/').pop()}</p>
                            <a 
                                href={`http://localhost:5000/${existingFile}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={styles.viewFile}
                            >
                                Voir le fichier actuel
                            </a>
                        </div>
                    )}
                    
                    <div 
                        className={`${styles.uploadBox} ${formData.file ? styles.hasFile : ''}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                    >
                        <Upload size={32} />
                        <p>
                            {formData.file 
                                ? `Fichier sélectionné: ${formData.file.name}`
                                : 'Glisser le fichier administratif (PDF) ici ou cliquer pour parcourir'}
                        </p>
                        <input
                            type="file"
                            name="file"
                            accept=".pdf"
                            onChange={handleChange}
                            className={styles.fileInput}
                            disabled={isSubmitting}
                        />
                        {formData.file && (
                            <button 
                                type="button" 
                                onClick={() => setFormData(prev => ({ ...prev, file: null }))}
                                className={styles.removeFileBtn}
                                disabled={isSubmitting}
                            >
                                <X size={16} /> Supprimer
                            </button>
                        )}
                    </div>
                    <p className={styles.fileNote}>Taille maximale : 5MB. Formats acceptés : PDF uniquement.</p>
                </section>

                <div className={styles.actions}>
                    <button 
                        type="button" 
                        onClick={() => navigate('/tasks')} 
                        className={styles.cancelBtn}
                        disabled={isSubmitting}
                    >
                        Annuler
                    </button>
                    <button 
                        type="submit" 
                        className={styles.submitBtn}
                        disabled={isSubmitting}
                    >
                        {isSubmitting ? (
                            <span>Enregistrement...</span>
                        ) : (
                            <>
                                <Save size={20} />
                                {isEditMode ? 'Modifier la Tâche' : 'Créer la Tâche'}
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TaskForm;