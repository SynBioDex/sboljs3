
import genbank = require('genbankjs')
import { Specifiers, Prefixes } from "bioterms";
import { S2Range, SBOL2GraphView } from "..";

export default function genbankToSBOL2(graph:SBOL2GraphView, uriPrefix:string, gb:string) {

    let gbf = genbank.parseGBF(gb)


    let sequence = graph.createSequence(uriPrefix, gbf.locusName + '_sequence', '1')

    if(gbf.moleculeType === 'DNA') {
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.NucleicAcid
    } else {
        sequence.encoding = Specifiers.SBOL2.SequenceEncoding.AminoAcid
    }

    if(gbf.definition)
        sequence.description = gbf.definition

    if(gbf.sequence)
        sequence.elements = gbf.sequence

    if(!gbf.locusName) {
        console.dir(gbf)
        throw new Error('missing locusName?')
    }

    let componentDefinition = graph.createComponentDefinition(uriPrefix, gbf.locusName, '1')

    if(gbf.moleculeType === 'DNA') {
        componentDefinition.type = Specifiers.SBOL2.Type.DNA
    } else {
        componentDefinition.type = Specifiers.SBOL2.Type.Protein
    }

    componentDefinition.description = gbf.definition

    for(let feature of gbf.features) {

        let name = feature.key

        if(feature['/gene'] && feature['/gene'][0]) {
            name = feature['/gene'][0]
        } else if(feature['/product'] && feature['/product'][0]) {
            name = feature['/product'][0]
        }

        let sequenceAnnotation = componentDefinition.annotateRange(feature.location.start, feature.location.end, name)

        if(feature.location.strand === 'complementary') {
            (sequenceAnnotation.locations[0] as S2Range).orientation = Specifiers.SBOL2.Orientation.ReverseComplement
        }

        let soTerm = genbankToSO[feature.key]

        if(soTerm) {
            sequenceAnnotation.addRole(soTerm)
        }
    }


}

var soToGenbank = {
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000001"]: "misc_feature",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000002"]: "misc_structure",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000005"]: "satellite",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000013"]: "scRNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000019"]: "stem_loop",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000112"]: "primer",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000139"]: "RBS",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000552"]: "RBS",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000140"]: "attenuator",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000141"]: "terminator",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000147"]: "exon",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000149"]: "source",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000165"]: "enhancer",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000167"]: "promoter",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000172"]: "CAAT_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000173"]: "GC_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000174"]: "TATA_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000175"]: "-10_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000176"]: "-35_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000185"]: "precursor_RNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000185"]: "prim_transcript",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000188"]: "intron",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000204"]: "5'UTR",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000205"]: "3'UTR",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000233"]: "misc_RNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000234"]: "mRNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000252"]: "rRNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000253"]: "tRNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000274"]: "snRNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000286"]: "LTR",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000296"]: "rep_origin",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000297"]: "D-loop",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000298"]: "misc_recomb",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000305"]: "modified_base",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000313"]: "stem_loop",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000316"]: "CDS",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000331"]: "STS",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000409"]: "misc_binding",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000410"]: "protein_bind",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000413"]: "misc_difference",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000418"]: "sig_peptide",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000419"]: "mat_peptide",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000458"]: "D_segment",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000470"]: "J_region",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000551"]: "polyA_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000553"]: "polyA_site",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000555"]: "5'clip",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000557"]: "3'clip",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000657"]: "repeat_region",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000704"]: "gene",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000723"]: "iDNA",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000725"]: "transit_peptide",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0000726"]: "repeat_unit",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001023"]: "allele",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001054"]: "transposon",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001060"]: "variation",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001411"]: "misc_signal",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001645"]: "misc_marker",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001833"]: "V_region",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001834"]: "C_region",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001835"]: "N_region",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0001836"]: "S_region",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0005836"]: "regulatory",
    [Prefixes.sequenceOntologyIdentifiersOrg + "SO:0005850"]: "primer_bind"
}

var genbankToSO:any = Object.create(null)

Object.keys(soToGenbank).forEach((uri) => {
    
    let gb = soToGenbank[uri]

    if(genbankToSO[gb] === undefined) {
        genbankToSO[gb] = uri
    }
})

