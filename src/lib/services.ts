import { db } from "./firebase";
import {
    collection,
    addDoc,
    doc,
    getDoc,
    getDocs,
    deleteDoc,
    query,
    orderBy,
    Timestamp,
    setDoc
} from "firebase/firestore";
import { Survey } from "@/types";

const COLLECTION_SURVEYS = "surveys";

export const createSurvey = async (survey: Survey) => {
    try {
        // We create a new document reference with auto-generated ID if not provided, 
        // or ensure we use the survey's ID if we want to force it.
        // For new surveys, let's let Firestore generate the ID or use the one we have.
        // Since we are generating UUIDs locally, we can use setDoc or addDoc. 
        // addDoc is easier for auto-ID, but we want to control the ID? 
        // Let's rely on Firestore Auto ID for cleaner URLs, or use our UUID.
        // For simplicity, let's treat the local ID as the source of truth for now, 
        // but typically generating ID on server is better.
        // Let's clean up the object before saving (remove undefined)

        const cleanSurvey = JSON.parse(JSON.stringify(survey));
        const docRef = await addDoc(collection(db, COLLECTION_SURVEYS), {
            ...cleanSurvey,
            createdAt: Timestamp.now()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error creating survey: ", e);
        throw e;
    }
};

export const updateSurvey = async (survey: Survey) => {
    try {
        if (!survey.id) throw new Error("Cannot update survey without ID");

        const cleanSurvey = JSON.parse(JSON.stringify(survey));
        const docRef = doc(db, COLLECTION_SURVEYS, survey.id);

        // Remove id from data to avoid duplication/confusion inside the doc
        delete cleanSurvey.id;

        await setDoc(docRef, {
            ...cleanSurvey,
            updatedAt: Timestamp.now()
        }, { merge: true });

        return survey.id;
    } catch (e) {
        console.error("Error updating survey: ", e);
        throw e;
    }
};




export const deleteSurvey = async (id: string) => {
    try {
        await deleteDoc(doc(db, COLLECTION_SURVEYS, id));
    } catch (e) {
        console.error("Error deleting survey: ", e);
        throw e;
    }
};

export const getAllSurveys = async (): Promise<Survey[]> => {
    try {
        const q = query(collection(db, COLLECTION_SURVEYS), orderBy("createdAt", "desc"));
        const querySnapshot = await getDocs(q);
        // IMPORTANTE: Ponemos ...doc.data() antes de id: doc.id para asegurar que el ID real de Firestore
        // sobrescriba cualquier ID interno que se haya guardado en el documento json.
        return querySnapshot.docs.map(doc => ({ ...doc.data(), id: doc.id } as Survey));
    } catch (e) {
        console.error("Error getting all surveys: ", e);
        return [];
    }
};

export const getSurvey = async (id: string): Promise<Survey | null> => {
    try {
        const docRef = doc(db, COLLECTION_SURVEYS, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { ...docSnap.data(), id: docSnap.id } as Survey;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting survey: ", e);
        throw e;
    }
};

export const submitResponse = async (surveyId: string, answers: Record<string, unknown>) => {
    try {
        const surveyRef = doc(db, COLLECTION_SURVEYS, surveyId);
        // Save to a subcollection 'responses'
        await addDoc(collection(surveyRef, "responses"), {
            answers,
            submittedAt: Timestamp.now()
        });
    } catch (e) {
        console.error("Error submitting response: ", e);
        throw e;
    }
};

export const getSurveyResponses = async (surveyId: string) => {
    try {
        const surveyRef = doc(db, COLLECTION_SURVEYS, surveyId);
        const querySnapshot = await getDocs(collection(surveyRef, "responses"));
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting responses: ", e);
        throw e;
    }
};

import { storage } from "./firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export const uploadImage = async (file: File): Promise<string> => {
    try {
        const storageRef = ref(storage, `banners/${Date.now()}_${file.name}`);
        const snapshot = await uploadBytes(storageRef, file);
        const downloadURL = await getDownloadURL(snapshot.ref);
        return downloadURL;
    } catch (e) {
        console.error("Error uploading image: ", e);
        throw e;
    }
};
