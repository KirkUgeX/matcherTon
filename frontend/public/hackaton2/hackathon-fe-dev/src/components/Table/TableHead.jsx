import "../../assets/components/Table/table-head.scss";

export const TableHead = ({ names = [] }) => {
    return (
        <div className="table-head">
            {names.map((item) => <div key={item} className="table-head__name">{item}</div>) }
        </div>
    );
};
