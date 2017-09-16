
import { Prefixes } from './Prefixes'

export namespace Specifiers {

    export namespace SBOL2 {

        export namespace Orientation {
            export const Inline:string = Prefixes.sbol2 + 'inline'
            export const ReverseComplement:string = Prefixes.sbol2 + 'reverseComplement'
        }
        
        export namespace Direction {

            export const Input:string = Prefixes.sbol2 + 'in'
            export const Output:string = Prefixes.sbol2 + 'out'
            export const InputAndOutput:string = Prefixes.sbol2 + 'inout'
            export const None:string = Prefixes.sbol2 + 'none'

        }
        
        export namespace Access {
            export const PublicAccess:string = Prefixes.sbol2 + 'public'
            export const PrivateAccess:string = Prefixes.sbol2 + 'private'
        }

        export namespace Role {

            export const CDS:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000316'
            export const Promoter:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000167'
            export const RBS:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000139'
            export const RestrictionSite:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0001687'
            export const Terminator:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000141'
            export const OriginOfReplication:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000296'
            export const OriginOfTransfer:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000724'
            export const PlasmidBackbone:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000755'
            export const EngineeredRegion:string = Prefixes.sequenceOntologyIdentifiersOrg + 'SO:0000804'

        }
        
        export namespace Type {
            export const DNA:string = 'http://www.biopax.org/release/biopax-level3.owl#DnaRegion'
            export const RNA:string = 'http://www.biopax.org/release/biopax-level3.owl#RnaRegion'
            export const Protein:string = 'http://www.biopax.org/release/biopax-level3.owl#Protein'
            export const SmallMolecule:string = 'http://www.biopax.org/release/biopax-level3.owl#SmallMolecule'
            export const Complex:string = 'http://www.biopax.org/release/biopax-level3.owl#Complex'
            export const Effector:string = 'http://identifiers.org/chebi/CHEBI:35224'
        }

        export namespace SequenceEncoding {
            export const NucleicAcid:string = 'http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html'
            export const RNA:string = 'http://www.chem.qmul.ac.uk/iubmb/misc/naseq.html'
            export const AminoAcid:string = 'http://www.chem.qmul.ac.uk/iupac/AminoAcid/'
        }

        export namespace SequenceConstraint {
            export const Precedes:string = Prefixes.sbol2 + 'precedes'
            export const OppositeOrientationAs:string = Prefixes.sbol2 + 'oppositeOrientationAs'
        }

    }

    export namespace Visual {

        /* opacity
         */
        export const Blackbox:string = Prefixes.visual + 'blackbox'
        export const Whitebox:string = Prefixes.visual + 'whitebox'

        /* display modes
         */
        export const Float:string = Prefixes.visual + 'float'
        export const Backbone:string = Prefixes.visual + 'backbone'

        /* orientation
         */
        export const Forward:string = Prefixes.visual + 'forward'
        export const Reverse:string = Prefixes.visual + 'reverse'

        /* expandability
         */
        export const Expandable:string = Prefixes.visual + 'expandable'
        export const NotExpandable:string = Prefixes.visual + 'notExpandable'

        export const AnchorTop:string = Prefixes.visual + 'anchorTop'
        export const AnchorMid:string = Prefixes.visual + 'anchorMid'
        export const AnchorBottom:string = Prefixes.visual + 'anchorBottom'
    }

    export namespace SBO {
        export const Inhibition:string = Prefixes.sbo + 'SBO:0000169'
        export const Inhibitor:string = Prefixes.sbo + 'SBO:0000020'
        export const Inhibited:string = Prefixes.sbo + 'SBO:0000642'
        export const Stimulation:string = Prefixes.sbo + 'SBO:0000170'
        export const Stimulator:string = Prefixes.sbo + 'SBO:0000459'
        export const Stimulated:string = Prefixes.sbo + 'SBO:0000643'
        export const GeneticProduction:string = Prefixes.sbo + 'SBO:0000589'
        export const Product:string = Prefixes.sbo + 'SBO:0000011'
        export const Modifier:string = Prefixes.sbo + 'SBO:0000019'
        export const Promoter:string = Prefixes.sbo + 'SBO:0000598'
    }

    export namespace GO {
        export const ProteinDepolymerization:string = Prefixes.go + 'GO:0051261'
        export const CovalentChromatinModification:string = Prefixes.go + 'GO:0016569'
        export const ProteinProcessing:string = Prefixes.go + 'GO:0016485'
        export const ProteinBinding:string = Prefixes.go + 'GO:0005515'
        export const CatalyticActivity:string = Prefixes.go + 'GO:0003824'
    }


}

