const Builder = function(builder){
    this.n3Data = builder.n3Data; 
}

Builder.generateOwl = (n3Data, result) => {

    let owlCode = `package owlapi.tutorial.sperimental;
import java.io.IOException;
import java.io.OutputStream;
import java.nio.file.Files;
import java.nio.file.Path;
import org.coode.owlapi.turtle.TurtleOntologyFormat;
import org.semanticweb.owlapi.apibinding.OWLManager;
import org.semanticweb.owlapi.model.IRI;
import org.semanticweb.owlapi.model.OWLAnonymousIndividual;
import org.semanticweb.owlapi.model.OWLAxiom;
import org.semanticweb.owlapi.model.OWLClass;
import org.semanticweb.owlapi.model.OWLDataFactory;
import org.semanticweb.owlapi.model.OWLDataProperty;
import org.semanticweb.owlapi.model.OWLIndividual;
import org.semanticweb.owlapi.model.OWLLiteral;
import org.semanticweb.owlapi.model.OWLObjectProperty;
import org.semanticweb.owlapi.model.OWLObjectPropertyAssertionAxiom;
import org.semanticweb.owlapi.model.OWLOntology;
import org.semanticweb.owlapi.model.OWLOntologyCreationException;
import org.semanticweb.owlapi.model.OWLOntologyManager;
import org.semanticweb.owlapi.model.OWLOntologyStorageException;
import org.semanticweb.owlapi.util.DefaultPrefixManager;

/**
 *
 * @author michele
 */
public class example20 {
    private static Path testFile;
    public static void main(String[] args) throws OWLOntologyCreationException, IOException, OWLOntologyStorageException{\n`;
    
    //Aggiungo creazione ontology manager e data factory
    owlCode += `
        //create ontology manager\n
        OWLOntologyManager manager = OWLManager.createOWLOntologyManager();\n
        //create data factory\n
        OWLDataFactory factory = manager.getOWLDataFactory();\n\n
        //creo la mia ontologia\n
        IRI ontologyIRI = IRI.create("http://owlapi.tutorial.michele");
        OWLOntology myOntology = manager.createOntology(ontologyIRI);\n\n`;


    //inserisco tutti i prefissi
    owlCode += `
        //creo il riferimento a ontolex e carico l'ontologia nel manager\n\n`;

    let prefixes = n3Data[n3Data.length-1];
    for(let key in prefixes){
        if(key == '""'){
            //do nothing
            null;
        }else{
            let removeBrakets = prefixes[key].replace(/[<>]/g, "");
            owlCode += `
        IRI ${key}Iri = IRI.create("${removeBrakets}");\n`;
        }
    }

    owlCode += "\n";
    owlCode += `
        DefaultPrefixManager pm = new DefaultPrefixManager();\n
        pm.setDefaultPrefix(ontologyIRI + "#");\n\n`;
    
    //assegnazione dei prefissi nel prefixManager
    for(let key in prefixes){
        if(key == ''){
            //do nothing
            null;
        }else{ //
            let removeBrakets = prefixes[key].replace(/[<>]/g, "");
            owlCode += `
        pm.setPrefix("${key}:", "${removeBrakets}");\n`;
        }
    }

    delete n3Data[[n3Data.length-1]];

    //lista di tutti gli individuali per non creare doppioni nelle variabili java
    let individuals = [];
    let properties = [];
    let classes = [];
    
    //adesso mi devo occupare del resto...
    for(let key in n3Data){
        console.log(n3Data[key]);

        let subject = n3Data[key]["subject"]["value"];
        let predicate = n3Data[key]["predicate"]["value"];
        let object = n3Data[key]["object"]["value"];
               
        let reClass = new RegExp(/([a-z]+.)#([A-Z].*)/);
        let reObject = new RegExp(/([a-z]+.)#([a-z].*)/);         
        let reResource = new RegExp(/http:.*dbpedia.*\/([A-Za-z].*)/);
        let reLang = new RegExp(/(iso).*\/([a-z].*)/);

        // Associazione con classe
        if(reClass.test(object) && (/^((?!owlapi).)*$/).test(object)){
            let nameClass = '';            
            nameClass = object.match(reClass)[2];                                
            if(classes.indexOf(nameClass) == -1){
                classes.push(nameClass);
                owlCode += `
        OWLClass ${nameClass} = factory.getOWLClass("${object}");\n`;
            }else{
                null;
            }

            //Caso in cui c'è un individuale anonimo
            let nameSubject = "";
            if(n3Data[key]["subject"]["termType"] == 'BlankNode'){
                nameSubject = subject.replace("-", "_");
                if(individuals.indexOf(nameSubject) == -1 ){
                    individuals.push(nameSubject);
                    owlCode += `
        OWLAnonymousIndividual ${nameSubject} = factory.getOWLAnonymousIndividual();\n`;
                }else{
                    null;
                }
            }else{
                if(subject.match(reObject) == null){
                    if(reClass.test(subject)){
                        nameSubject = subject.match(reClass)[2];                        
                    }else if(subject.match(/#(\w.*)/)){
                        nameSubject = subject.match(/#(\w.*)/)[1].replace(/[\-]/g, "_");
                    }
                    else{
                        nameSubject = subject.match(/\/\/(\w.*)\/(\w+)$/)[2]; 
                    }
                }else{
                    nameSubject = subject.match(reObject)[2].replace(/[\-]/g, "_");  //TODO: nomi con < brackets >
                }                
                if(individuals.indexOf(nameSubject) == -1){
                    individuals.push(nameSubject);                               
                    owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");\n`;
                }else{
                    null;
                }
            }            
                                                
            //Aggiungo assioma
            owlCode += `    
        manager.addAxiom(myOntology, factory.getOWLClassAssertionAxiom(${nameClass}, ${nameSubject}));\n\n`;
        }

        //Associazione con datatype
        else if(!reObject.test(object) && (n3Data[key]["object"]["language"] != undefined)){

            const nameDataProperty = predicate.match(reObject)[2];            
            if(properties.indexOf(nameDataProperty) == -1 ){
                properties.push(nameDataProperty);
                owlCode += `
        OWLDataProperty ${nameDataProperty} = factory.getOWLDataProperty("${predicate}");\n`;
            }else {
                null;
            }

            //Subject
            let nameSubject = "";
            
            //Caso in cui c'è un individuale anonimo
            if(n3Data[key]["subject"]["termType"] == 'BlankNode'){
                nameSubject = subject.replace(/[\-]/g, "_");
                if(individuals.indexOf(nameSubject) == -1 ){
                    individuals.push(nameSubject);
                    owlCode += `
        OWLAnonymousIndividual ${nameSubject} = factory.getOWLAnonymousIndividual();\n`;
                }
            }else{
                if(reClass.test(subject)){
                    nameSubject = subject.match(reClass)[2];
                }
                else if(reObject.test(subject)){
                    nameSubject = subject.match(reObject)[2];
                }else if((/\/\/(\w.*)\/(\w+)$/).test(subject)){
                    nameSubject = subject.match(/\/\/(\w.*)\/(\w+)$/)[2];
                }              
                if(individuals.indexOf(nameSubject) == -1){
                    individuals.push(nameSubject);                               
                    owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");\n`;
                }else{
                    null;
                }
            }
            

            //Literal
            let nameLanguage = "";
            if(n3Data[key]["object"]["language"] != ''){
                nameLanguage = nameSubject+"_"+n3Data[key]["object"]["language"];
                if(individuals.indexOf(nameLanguage) == -1) {
                    individuals.push(nameLanguage);
                    owlCode += `
        OWLLiteral l_${nameLanguage} = factory.getOWLLiteral("${object}",  "${n3Data[key]["object"]["language"]}");\n
        OWLAxiom label_${nameLanguage} = factory.getOWLDataPropertyAssertionAxiom(${nameDataProperty}, ${nameSubject}, l_${nameLanguage});\n
        manager.addAxiom(myOntology, label_${nameLanguage}); \n\n`;
                }else{
                    null;
                }
            }else {
                nameLanguage = nameSubject+"_"+object.replace(/[\.\s\'\-]/g, "_");                
                if(individuals.indexOf(nameLanguage) == -1) {
                    individuals.push(nameLanguage);
                    owlCode += `
        OWLLiteral l_${nameLanguage} = factory.getOWLLiteral("${object}");\n
        OWLAxiom label_${nameLanguage} = factory.getOWLDataPropertyAssertionAxiom(${nameDataProperty}, ${nameSubject}, l_${nameLanguage});\n
        manager.addAxiom(myOntology, label_${nameLanguage}); \n\n`;
                }else{
                    null;
                }
            }                        
            
            //Aggiungo assioma
                                           
        }

        //altre associazioni
        else{

            //PREDICATE 
            let nameObjectProperty = ""; 
            if(reObject.test(predicate)){
                //nameObjectProperty = predicate.match(reObject)[2]; TODO: VERIFICARE SE SI SPACCA QUALCOSA
                nameObjectProperty = predicate.match(reObject)[1] + predicate.match(reObject)[2];
                nameObjectProperty = nameObjectProperty.replace(/\//g, "_");
            }else if((/([a-z]+.)#_(\w)*/).test(predicate)){
                nameObjectProperty = predicate.match(/([a-z]+.)#_(\w)*/)[2];
            }else if((/(\w*)#(\w*)/).test(predicate)){
                nameObjectProperty = predicate.match(/(\w*)#(\w*)/)[2];
            }    
            if(properties.indexOf(nameObjectProperty) == -1 ){
                properties.push(nameObjectProperty);
                owlCode += `
        OWLObjectProperty ${nameObjectProperty} = factory.getOWLObjectProperty("${predicate}");\n`;
            }else {
                null;
            }
                        
            let nameSubject = "";
            let nameObject = "";

            //Caso in cui c'è un individuale anonimo
            if(n3Data[key]["subject"]["termType"] == 'BlankNode'){
                nameSubject = subject.replace(/[\-]/g, "_");
                if(reResource.test(object)){
                    nameObject = object.match(reResource)[object.match(reResource).length-1];
                    owlCode += `
        OWLIndividual ${nameObject} = factory.getOWLNamedIndividual("${object}");`;
                }else if(reObject.test(subject)){
                    nameSubject = subject.match(reObject)[subject.match(reObject).length-1];
                    if(individuals.indexOf(nameSubject) == -1){
                        individuals.push(nameSubject);
                        owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");`;
                    }else{
                        null;
                    }                    
                }else if(reObject.test(object)){
                    nameObject = object.match(reObject)[object.match(reObject).length-1];
                    if(individuals.indexOf(nameObject) == -1){
                        individuals.push(nameObject);
                        owlCode += `
        OWLIndividual ${nameObject} = factory.getOWLNamedIndividual("${object}");`;
                    }else{
                        null;
                    }                    
                }
                if(individuals.indexOf(nameSubject) == -1 ){
                    individuals.push(nameSubject);
                    owlCode += `
        OWLAnonymousIndividual ${nameSubject} = factory.getOWLAnonymousIndividual();\n`;
                }else{
                    null;
                }
            }
            else if(n3Data[key]["object"]["termType"] == 'BlankNode'){
                nameObject = object.replace(/[\-]/g, "_");
                if(reResource.test(subject)){
                    nameSubject = subject.match(reResource)[subject.match(reResource).length-1];
                    owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");`;
                }else if(reObject.test(subject)){
                    nameSubject = subject.match(reObject)[subject.match(reObject).length-1].replace(/[\-]/g, "_");
                    if(individuals.indexOf(nameSubject) == -1) {
                        individuals.push(nameSubject);
                        owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");`;
                    }else {
                        null;
                    }                    
                }
                if(individuals.indexOf(nameObject) == -1 ){
                    individuals.push(nameObject);
                    owlCode += `
        OWLAnonymousIndividual ${nameObject} = factory.getOWLAnonymousIndividual();\n`;
                }else{
                    null;
                }
            }

            //Caso in cui non c'è un individuale anonimo
            else{

                //Caso in cui c'è una risorsa
                if(reResource.test(subject)){
                    nameSubject = subject.match(reResource)[2];
                    if(individuals.indexOf(nameSubject) == -1){
                        individuals.push(nameSubject);
                        owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");\n`;
                    }else{
                        null;
                    }
                }else if(reResource.test(object)){                    
                    nameObject = object.match(reResource)[object.match(reResource).length-1];
                    nameSubject = subject.match(reObject)[2];                
                    if(individuals.indexOf(nameObject) == -1){
                        individuals.push(nameObject);
                        owlCode += `
        OWLIndividual ${nameObject} = factory.getOWLNamedIndividual("${object}");\n`;
                    }else{
                        null;
                    }
                }

                //Caso in cui ci sono solo individuali
                else{  

                    if(object.match(reObject) == null){
                        if(object.match(reLang) == null && object.match(reClass) == null && (/(iso\w*)#(\w.*)/).test(object)){
                            nameObject = object.match(/(iso\w*)#(\w.*)/)[0].replace(/#/g, "_"); //TODO: sistemare sta roba de merda
                        }else if(object.match(reLang) == null && object.match(reClass) != null){
                            nameObject = object.match(reClass)[2]; //TODO: sistemare sta roba de merda
                        }else if((/\/(\w+)$/).test(object)){
                            nameObject = object.match(/\/(\w+)$/)[1];
                        }else if((/\/(\w.*\.*)\/$/).test(object)){
                            nameObject = object.match(/\/(\w.*\.*)\/$/)[1].replace(/\./g, "_");
                        }else if(object.match(/#(\w.*)/) != null){
                            nameObject = object.match(/#(\w.*)/)[1].replace(/[\-]/g);
                        }
                        else{
                            nameObject = object.match(reLang)[0].replace(/[\/\.-]/g, "_");
                        }
                    }else{
                        nameObject = object.match(reObject)[2].replace(/[\/\.-]/g, "_");
                    }

                    if(subject.match(reObject) == null){
                        if(subject.match(reLang) == null && !reClass.test(subject) && subject.match(/#(\w.*)/) == null){
                            nameSubject = subject.match(/\/\/(\w.*)\/(\w+)$/)[subject.match(/\/\/(\w.*)\/(\w+)$/).length-1]; //TODO: sistemare sta roba de merda
                        }else if(subject.match(/#(\w.*)/) != null){
                            nameSubject = subject.match(/#(\w.*)/)[1].replace(/[\-]/g);
                        }
                        else if(reClass.test(subject)){
                            nameSubject = subject.match(reClass)[2]; 
                        }
                        else{
                            nameSubject = subject.match(reLang)[0];
                        }
                    }else{
                        nameSubject = subject.match(reObject)[2].replace(/[\-]/g, "_");
                    }

                    if(individuals.indexOf(nameSubject) == -1){
                        individuals.push(nameSubject);
                        owlCode += `
        OWLIndividual ${nameSubject} = factory.getOWLNamedIndividual("${subject}");\n`;
                    }else{
                        null;
                    }

                    if(individuals.indexOf(nameObject) == -1){
                        individuals.push(nameObject);
                        owlCode += `
        OWLIndividual ${nameObject} = factory.getOWLNamedIndividual("${object}");\n`;
                    }else{
                        null;
                    }
                }
            } 
            
            //Aggiungo assioma
            owlCode += `
        OWLObjectPropertyAssertionAxiom ${nameSubject}_${nameObjectProperty}_${nameObject} = factory.getOWLObjectPropertyAssertionAxiom(${nameObjectProperty}, ${nameSubject}, ${nameObject});\n
        manager.addAxiom(myOntology, ${nameSubject}_${nameObjectProperty}_${nameObject}); \n\n`;
        }                
    }

    owlCode += `
        testFile = Files.createTempFile("prov", ".ttl");
        TurtleOntologyFormat turtleFormat = new TurtleOntologyFormat();
        turtleFormat.copyPrefixesFrom(pm);
        turtleFormat.setDefaultPrefix(ontologyIRI + "#");

        try (OutputStream outputStream = Files.newOutputStream(testFile)) {
                manager.saveOntology(myOntology, turtleFormat,				
                                outputStream);
        }
        System.out.println(testFile);
    }
}`;

    const outputCode = {
        'output' : owlCode
    };
    
    result(null, outputCode);
}

module.exports = Builder;

