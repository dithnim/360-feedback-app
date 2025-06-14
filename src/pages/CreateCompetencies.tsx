import Navbar from "../components/Navbar";
import { Button } from "../components/ui/Button";
import { useForm, useFieldArray } from "react-hook-form";

interface Question {
  id: string;
  text: string;
  options: string[]; // Options for radio buttons
  answer?: string;
}

interface CompetencySection {
  id: string;
  title: string;
  description: string;
  questions: Question[];
}

interface FormData {
  competency: string;
  description: string;
  sections: CompetencySection[];
}

const CreateCompetencies = () => {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    defaultValues: {
      competency: "",
      description: "",
      sections: [
        {
          id: "default-section",
          title: "Leadership",
          description: "",
          questions: [
            {
              id: "q1",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [
                "Strongly Agree",
                "Agree",
                "Neutral",
                "Strongly Disagree",
                "Disagree",
              ],
            },
            {
              id: "q2",
              text: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Aenean commodo?",
              options: [
                "Strongly Agree",
                "Agree",
                "Neutral",
                "Strongly Disagree",
                "Disagree",
              ],
            },
          ],
        },
      ],
    },
  });

  const {
    fields: sectionFields,
    append: appendSection,
    remove: removeSection,
  } = useFieldArray({
    control,
    name: "sections",
  });

  const onSubmit = (data: FormData) => {
    console.log(data);
    // Handle survey save logic here
  };

  const addQuestion = (sectionIndex: number) => {
    // This will be implemented using useFieldArray for questions within each section
    console.log(`Add question to section ${sectionIndex}`);
  };

  const removeQuestion = (sectionIndex: number, questionIndex: number) => {
    // This will be implemented using useFieldArray for questions within each section
    console.log(
      `Remove question from section ${sectionIndex} at index ${questionIndex}`
    );
  };

  const addNewSection = () => {
    appendSection({
      id: `section-${sectionFields.length + 1}`,
      title: "New Section",
      description: "",
      questions: [],
    });
  };

  return (
    <div>
      <div>
        <Navbar />
      </div>
      <div className="h-full px-50 pt-10">
        <label
          htmlFor="create from scratch"
          className="text-3xl font-semibold mb-8"
        >
          Create from Scratch
        </label>

        <form onSubmit={handleSubmit(onSubmit)} className="mt-8">
          <div className="mb-5">
            <label
              htmlFor="competency"
              className="block mb-2 text-lg text-gray-500"
            >
              Competency*
            </label>
            <input
              type="text"
              id="competency"
              className={`bg-gray-50 border ${
                errors.competency ? "border-red-500" : "border-gray-300"
              } text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full px-2.5 py-3.5 font-bold`}
              {...register("competency", {
                required: "Competency is required",
              })}
            />
            {errors.competency && (
              <p className="mt-1 text-sm text-red-500">
                {errors.competency.message}
              </p>
            )}
          </div>

          <div className="mb-5">
            <label
              htmlFor="description"
              className="block mb-2 text-lg text-gray-500"
            >
              Description (optional)
            </label>
            <textarea
              id="description"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-md rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full font-bold p-2.5"
              rows={4}
              {...register("description")}
            ></textarea>
          </div>

          {sectionFields.map((section, sectionIndex) => (
            <div
              key={section.id}
              className="mt-8 p-6 border rounded-lg shadow-md bg-white"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xl font-semibold">{section.title}</h3>
                {sectionIndex > 0 && (
                  <Button
                    variant="destructive"
                    className="p-2"
                    onClick={() => removeSection(sectionIndex)}
                  >
                    🗑️
                  </Button>
                )}
              </div>

              {/* Questions within the section */}
              {section.questions.map((question, questionIndex) => (
                <div key={question.id} className="mb-4 p-4 border rounded-md">
                  <div className="flex justify-between items-center mb-2">
                    <label className="block text-gray-700 text-lg">
                      {questionIndex + 1}. {question.text}
                    </label>
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        className="p-2"
                        onClick={() => console.log("edit question")}
                      >
                        ✏️
                      </Button>
                      <Button
                        variant="destructive"
                        className="p-2"
                        onClick={() =>
                          removeQuestion(sectionIndex, questionIndex)
                        }
                      >
                        ➖
                      </Button>
                    </div>
                  </div>
                  <div className="flex space-x-4">
                    {question.options.map((option) => (
                      <label key={option} className="inline-flex items-center">
                        <input
                          type="radio"
                          className="form-radio h-5 w-5 text-red-600"
                          value={option}
                          {...register(
                            `sections.${sectionIndex}.questions.${questionIndex}.answer`,
                            { required: true }
                          )}
                        />
                        <span className="ml-2 text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}

              <Button
                variant="save"
                className="mt-4 p-3 text-lg cursor-pointer"
                onClick={() => addQuestion(sectionIndex)}
              >
                Add Question
              </Button>
            </div>
          ))}

          <Button
            variant="default"
            className="mt-8 p-3 text-lg cursor-pointer"
            onClick={addNewSection}
          >
            + New Section
          </Button>

          <div className="flex justify-end mt-10">
            <Button
              type="submit"
              variant="save"
              className="p-6 text-lg cursor-pointer me-3"
            >
              Save Survey
            </Button>
            <Button variant="previous" className="p-6 text-lg cursor-pointer">
              Preview
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateCompetencies;
