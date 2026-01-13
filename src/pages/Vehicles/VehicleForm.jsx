import { useState } from 'react';
import { X, Save } from 'lucide-react';
import axios from 'axios';
import styles from './VehicleForm.module.css';

const VehicleForm = ({ onClose, onSuccess, vehicle }) => {
    const [formData, setFormData] = useState({
        brand: vehicle?.brand || '',
        model: vehicle?.model || '',
        matricule: vehicle?.matricule || '',
        type: vehicle?.type || 'Service',
        status: vehicle?.status || 'available',
        capacite: vehicle?.capacite || 1
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (vehicle) {
                await axios.put(`/vehicles/${vehicle._id}`, formData);
            } else {
                await axios.post('/vehicles', formData);
            }

            if (onClose) onClose();
            if (onSuccess) onSuccess();
        } catch (error) {
            console.error('Erreur lors de l\'enregistrement du véhicule', error);
            alert('Erreur lors de l\'enregistrement');
        }
    };

    return (
        <div className={styles.overlay}>
            <div className={styles.modal}>
                <div className={styles.header}>
                    <h3>{vehicle ? 'Modifier Véhicule' : 'Nouveau Véhicule'}</h3>
                    <button onClick={onClose} className={styles.closeBtn}>
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className={styles.form}>
                    <div className={styles.formGroup}>
                        <label>Marque</label>
                        <input
                            type="text"
                            value={formData.brand}
                            onChange={e => setFormData({ ...formData, brand: e.target.value })}
                            placeholder="ex: Renault"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Modèle</label>
                        <input
                            type="text"
                            value={formData.model}
                            onChange={e => setFormData({ ...formData, model: e.target.value })}
                            placeholder="ex: Clio 5"
                            required
                        />
                    </div>

                    <div className={styles.formGroup}>
                        <label>Matricule</label>
                        <input
                            type="text"
                            value={formData.matricule}
                            onChange={e => setFormData({ ...formData, matricule: e.target.value })}
                            placeholder="ex: 12345-A-1"
                            required
                        />
                    </div>

                    <div className={styles.row}>
                        <div className={styles.formGroup}>
                            <label>Type</label>
                            <select
                                value={formData.type}
                                onChange={e => setFormData({ ...formData, type: e.target.value })}
                            >
                                <option value="Service">Service</option>
                                <option value="Personnel">Personnel</option>
                                <option value="Fonction">Fonction</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label>Statut Initial</label>
                            <select
                                value={formData.status}
                                onChange={e => setFormData({ ...formData, status: e.target.value })}
                            >
                                <option value="available">Disponible</option>
                                <option value="maintenance">Maintenance</option>
                                <option value="in-use">En utilisation</option>
                            </select>
                        </div>

                       
                    </div>
                    <div className={styles.formGroup}>
                            <label>Capacité</label>
                            <input
                                type="number"
                                min="1"
                                value={formData.capacite}
                                onChange={e => setFormData({ 
                                    ...formData, 
                                    capacite: parseInt(e.target.value, 10)
                                })}
                                required
                            />
                        </div>
                    <div className={styles.actions}>
                        <button type="button" onClick={onClose} className={styles.cancelBtn}>
                            Annuler
                        </button>
                        <button type="submit" className={styles.submitBtn}>
                            <Save size={18} />
                            Enregistrer
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default VehicleForm;
