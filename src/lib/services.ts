import { db } from "./firebase";
import {
    collection,
    addDoc,
    doc,
    getDoc,
    updateDoc,
    getDocs,
    Timestamp
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

export const getSurvey = async (id: string): Promise<Survey | null> => {
    try {
        const docRef = doc(db, COLLECTION_SURVEYS, id);
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
            return { id: docSnap.id, ...docSnap.data() } as Survey;
        } else {
            console.log("No such document!");
            return null;
        }
    } catch (e) {
        console.error("Error getting survey: ", e);
        throw e;
    }
};

export const submitResponse = async (surveyId: string, answers: Record<string, any>) => {
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
