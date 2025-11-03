import type { TableProps } from '../../types';
import styles from '../../styles/components/Table.module.css';

function Table<T extends Record<string, any>>({
  data,
  columns,
  onRowClick,
}: TableProps<T>) {
  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead className={styles.thead}>
          <tr>
            {columns.map((column) => (
              <th key={String(column.key)} className={styles.th}>
                {column.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr
              key={item.id || index}
              className={styles.tr}
              onClick={() => onRowClick?.(item)}
            >
              {columns.map((column) => (
                <td key={`${item.id || index}-${String(column.key)}`} className={styles.td}>
                  {column.render
                    ? column.render(item[column.key], item)
                    : String(item[column.key] || '')}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default Table;