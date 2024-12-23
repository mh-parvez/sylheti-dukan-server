
interface FuncDocument extends Document {
    createdAt: Date;
    discount?: number;
    total?: number;
}

type FuncProps = {
    length: number;
    docArray: FuncDocument[];
    today: Date;
    property?: "discount" | "total";
}

export const getMonthlyData: any = ({ length, docArray, today, property }: FuncProps) => {
  
    const data: number[] = new Array(length).fill(0);

    docArray.forEach((i) => {
        const creationDate = i.createdAt;
        const monthDiff = (today.getMonth() - creationDate.getMonth() + 12) % 12;

        if (monthDiff < length) {
            data[length - monthDiff - 1] += property ? i[property]! : 1;
        }
    })

    return data;
}
