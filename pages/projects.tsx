import siteMetadata from '@/data/siteMetadata'
import projectsData from '@/data/projectsData'
import Card from '@/components/Card'
import { PageSEO } from '@/components/SEO'

export default function Projects() {
  return (
    <>
      <PageSEO title={`Projects - ${siteMetadata.author}`} description={siteMetadata.description} />
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Projects
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Projects I have contributed to
          </p>
        </div>
        <div className="container py-12">
          <div className="-m-3 flex flex-wrap">
            {projectsData.map((d) => (
              <Card
                key={d.title}
                title={d.title}
                description={d.description}
                imgSrc={d.imgSrc}
                href={d.href}
              />
            ))}
          </div>
        </div>
        <div className="space-y-2 pt-6 pb-8 md:space-y-5">
          <h1 className="text-3xl font-extrabold leading-9 tracking-tight text-gray-900 dark:text-gray-100 sm:text-4xl sm:leading-10 md:text-6xl md:leading-14">
            Publications
          </h1>
          <p className="text-lg leading-7 text-gray-500 dark:text-gray-400">
            Publications I have contributed to
          </p>
          <p>
            Escalona M, <b className="underline decoration-orange-500">VanCampen J</b>, Maurer NW,
            Haukness M, Okhovat M, Harris RS, Watwood A, Hartley GA, O'Niel RJ, Medvedev P, Makova
            KD, Vollmers C, Carbone L, Green RE. Whole-genome sequence and assembly of the Javan
            gibbon (Hylobates moloch). <i>Journ. Heredit.</i>, esac043;{' '}
            <a
              href="https://doi.org/10.1093/jhered/esac043"
              className="underline decoration-indigo-500"
            >
              doi: https://doi.org/10.1093/jhered/esac043.
            </a>
            .
          </p>
          <p>
            Yashar WM, Kong G, <b className="underline decoration-orange-500">VanCampen J</b>, Smith
            BM, Coleman DJ, Carbone L, Gürkan GY, Maxson JE, Braun TP. GoPeaks: Histone Modification
            Peak Calling for CUT&TAG. bioRxiv 2022.01.475735;{' '}
            <a
              className="underline decoration-indigo-500"
              href="https://doi.org/10.1101/2022.01.10.475735"
            >
              doi: https://doi.org/10.1101/2022.01.10.475735
            </a>
            .
          </p>
          <p>
            Yashar WM, Smith BM, Coleman DJ,{' '}
            <b className="underline decoration-orange-500">VanCampen J</b>, Kong G, Estabrook J,
            Demir E, Long N, Bottomly D, McWeeney SK, Tyner JW, Durker BJ, Maxson JE, Braun TP. Dual
            Targeting of FLT3 and LSD 1 Disrupts the MYC Super- Enhancer Complex in Acute Myeloid
            Leukemia. BioRxiv 2022.01.17.476469;{' '}
            <a
              className="underline decoration-indigo-500"
              href="https://doi.org/10.1101/2022.01.17.476469"
            >
              doi: https://doi.org/10.1101/2022.01.17.476469
            </a>
            .
          </p>
          <p>
            Krishnan J, Seidel CW, Zhang N,{' '}
            <b className="underline decoration-orange-500">VanCampen J</b>, Peuß R, Xiong S, Kenzir
            A, Li H, Conway JW, Rohner N. Genome- wide analysis of cis-regulatory changes in the
            metabolic adaptation of cavefish. BioRxiv 2020.08.27.270371;{' '}
            <a
              className="underline decoration-indigo-500"
              href="https://doi.org/10.1101/2020.08.27.270371"
            >
              doi: https://doi.org/10.1101/2020.08.27.270371
            </a>
            .
          </p>
        </div>
      </div>
    </>
  )
}
